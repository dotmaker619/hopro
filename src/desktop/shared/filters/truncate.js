function Truncate(str, length, ellipses) {
  length = length || 20;
  if (!str) return "";
  if (str && str.length <= length) {
    // let spaces = '';
    // for (let i = 0; i < length - str.length; i++) {
    //   spaces += ".";
    // }
    // spaces += ""
    return str;
  }

  if (ellipses === undefined) {
    ellipses = "...";
  }
  ellipses = "" + ellipses;
  str = str.slice(0, length);

  return str + ellipses;
}

function TruncateMiddle(str, length, ellipses) {
  length = length || 20;
  if (!str) return "";
  if (str && str.length <= length) {
    return str;
  }

  if (ellipses === undefined) {
    ellipses = "...";
  }
  ellipses = "" + ellipses;

  str = str.slice(0, length/2) + ellipses + str.slice(str.length - length/2 ,str.length);

  return str;
}

export { Truncate , TruncateMiddle }
