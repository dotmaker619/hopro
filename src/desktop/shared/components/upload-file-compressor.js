const { Plugin } = require("@uppy/core");
const Translator = require("@uppy/utils/lib/Translator");
import Compressor from "compressorjs";

class UppyImageCompressor extends Plugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || "ImageCompressor";
    this.type = "modifier";

    this.defaultLocale = {
      strings: {
        compressingImages: "Compressing images...",
      },
    };

    const defaultOptions = {
      quality: 0.6,
    };

    this.opts = Object.assign({}, defaultOptions, opts);

    // we use those internally in `this.compress`, so they
    // should not be overriden
    delete this.opts.success;
    delete this.opts.error;

    this.i18nInit();

    this.prepareUpload = this.prepareUpload.bind(this);
    this.compress = this.compress.bind(this);
  }

  setOptions(newOpts) {
    super.setOptions(newOpts);
    this.i18nInit();
  }

  i18nInit() {
    this.translator = new Translator([
      this.defaultLocale,
      this.uppy.locale,
      this.opts.locale,
    ]);
    this.i18n = this.translator.translate.bind(this.translator);
    this.setPluginState(); // so that UI re-renders and we see the updated locale
  }

  compress(blob) {
    return new Promise(
      (res, rej) =>
        new Compressor(blob, {
          quality: 0.8,
          maxWidth: 1024,
          width: 1024,
          checkOrientation: false,
          convertSize: 0,
          success(result) {
            res(result);
          },
          error(err) {
            rej(err);
          },
        })
    );
  }

  prepareUpload(fileIDs) {
    const promises = fileIDs.map((fileID) => {
      const file = this.uppy.getFile(fileID);
      this.uppy.emit("preprocess-progress", file, {
        mode: "indeterminate",
        message: this.i18n("compressingImages"),
      });

      if (file.type.split("/")[0] !== "image") {
        return;
      }

      return this.compress(file.data)
        .then((compressedBlob) => {
          this.uppy.log(
            `[Image Compressor] Image ${file.id} size before/after compression: ${file.data.size} / ${compressedBlob.size}`
          );
          this.uppy.setFileState(fileID, {
            data: compressedBlob,
            name: compressedBlob.name,
            type: compressedBlob.type,
          });
        })
        .catch((err) => {
          this.uppy.log(
            `[Image Compressor] Failed to compress ${file.id}:`,
            "warning"
          );
          this.uppy.log(err, "warning");
        });
    });

    const emitPreprocessCompleteForAll = () => {
      fileIDs.forEach((fileID) => {
        const file = this.uppy.getFile(fileID);
        this.uppy.emit("preprocess-complete", file);
      });
    };

    // Why emit `preprocess-complete` for all files at once, instead of
    // above when each is processed?
    // Because it leads to StatusBar showing a weird “upload 6 files” button,
    // while waiting for all the files to complete pre-processing.
    return Promise.all(promises).then(emitPreprocessCompleteForAll);
  }

  install() {
    this.uppy.addPreProcessor(this.prepareUpload);
  }

  uninstall() {
    this.uppy.removePreProcessor(this.prepareUpload);
  }
}

export default UppyImageCompressor;
