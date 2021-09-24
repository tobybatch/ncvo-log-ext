export const attachFilters = () => {
    $("#ncvoext-controls-component-select").on("change", event => {
        const target = ".ncvoext-component-" + event.currentTarget.value.replace(".", "-").replace("_", "-").toLowerCase();
        $(".ncvoext-component").parent().hide();
        $(target).parent().show();
    });

    $(".ncvoext-controls-level:checkbox").on("change", event => {
        $(".ncvoext-controls-level:checkbox").each((index, checkbox) => {
            const attr = $(checkbox).attr("name");
            if (checkbox.checked) {
                $(".ncvoext-level-" + attr).parent().show();
            } else {
                $(".ncvoext-level-" + attr).parent().hide();
            }
        });
    });

}

export const decodeLogs = () => {
    const rawData = $("#ncvoext-logger").data("logger");
    if (rawData === undefined) {
        return;
    }
    const data = atob(rawData);
    const lines = JSON.parse(data);
    const content = $("<table class='ncvoext-table'>");
    const components = [];
    lines.forEach(line => {
        // level
        const level = line.split("-")[3].trim();
        // component
        const tail = line.substr(line.indexOf("front")); // Strip off date/level
        const start = tail.indexOf(".") + 1;
        let component = tail.substr(
            start, // string the first module (front_controller), we don't need it
            tail.indexOf(":") - start, //; the component name ends with :
        );
        if (component.trim() === "") {
            component = "front_controller";
        }
        if (components.indexOf(component) === -1) {
            components.push(component.trim());
        }
        const message = tail.substr(tail.indexOf(":") + 1)
        const tr = $('<tr>');
        tr.append('<td class="ncvoext-level ncvoext-level-' + level.toLowerCase() + '">' + level + '</td>');
        tr.append('<td class="ncvoext-component ncvoext-component-' + component.replace(".", "-").replace("_", "-").toLowerCase() + '">' + component + '</td>');
        tr.append('<td class="ncvoext-message">' + message + '</td>');
        content.append(tr);
    });
    components.forEach(component => {
        $("#ncvoext-controls-component-select").append("<option value='" + component + "'>" + component + "</option>")
    })
    $("#ncvoext-logger-content").append(content);
};
