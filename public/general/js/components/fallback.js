function addFullBack(selector, msg) {
    selector.prepend(`
    <div class="contentFallBack">
        <h2>No Result To Display</h2>
        <div>
    `)
}
function removeFullBack(selector) { selector.find(".contentFallBack").remove() }
