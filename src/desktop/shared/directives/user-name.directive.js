let update = (el, binding, vnode) => {
    let user = vnode.context.$store.getters.state_users[binding.value.uid]
    if (user && user.first_name)
        el.innerText = user.first_name + " " + user.last_name
    else if (user) el.innerText = user.email;
    else el.innerText = binding.value.email && binding.value.email.includes('@sensehawk') ? "Sensehawk" : "Unknown";
}
export default {
    bind: update,
    update
}
