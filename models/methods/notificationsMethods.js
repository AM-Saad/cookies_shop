module.exports.create = (userId, notifyFromName, notifyOn, content) => {
    const newNotification = {
        to: userId,
        notifyFromName: notifyFromName,
        notifyOn: notifyOn,
        content: content
    }
    return newNotification
}

