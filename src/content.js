const modalSrcUrl = chrome.extension.getURL("modal.html");
fetch(modalSrcUrl)
  .then((response) => response.text())
  .then((text) => {
    $(document.body).append($(text));

    const data = atob($("#ncvo-logger").data("logger"));
    const lines = JSON.parse(data);
    const content = $("<table class='ncvo-table'>");
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
      tr.append('<td class="ncvo-level ncvo-level-' + level.toLowerCase() + '">' + level + '</td>');
      tr.append('<td class="ncvo-component ncvo-component-' + component.replace(".", "-").replace("_", "-").toLowerCase() + '">' + component + '</td>');
      tr.append('<td class="ncvo-message">' + message + '</td>');
      content.append(tr);
    });
    components.forEach(component => {
      $("#ncvo-controls-component-select").append("<option value='" + component + "'>" + component + "</option>")
    })
    $("#ncvo-logger-content").append(content);

    $("#ncvo-controls-component-select").on("change", event => {
      const target = ".ncvo-component-" + event.currentTarget.value.replace(".", "-").replace("_", "-").toLowerCase();
      $(".ncvo-component").parent().hide();
      $(target).parent().show();
    });

    $(".ncvo-controls-level:checkbox").on("change", event => {
      $(".ncvo-controls-level:checkbox").each((index, checkbox) => {
        const attr = $(checkbox).attr("name");
        if (checkbox.checked) {
          $(".ncvo-level-" + attr).parent().show();
        } else {
          $(".ncvo-level-" + attr).parent().hide();
        }

      });
    });
  });

const footerSrcUrl = chrome.extension.getURL("footer.html");
fetch(footerSrcUrl)
  .then((response) => response.text()) //assuming file contains json
  .then((text) => {
    $(document.body).append($(text));

    $("#ncvo-logger-btn").on("click", (event) => {
      $("#ncvo-logger-dialog").dialog({
        resizable: false,
        modal: true,
        width: 1200,
      })
    });
  });
