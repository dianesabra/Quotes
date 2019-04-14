$.getJSON("/quotes", function(data) {
  for (var i = 0; i < data.length; i++) {
    $("#quotes").append(
      "<div class='card'><div class='card-body'>" +
        "<h5 class='card-title'>" +
        data[i].headline +
        "</h5>" +
        "<p data-id='" +
        data[i]._id +
        "'" +
        " class='card-text'>" +
        data[i].summary +
        "</p><a href='" +
        data[i].url +
        "' class='card-link' target=_blank>See More</a></div></div>"
    );
  }
});

$(document).on("click", "p", function() {
  $("#comments").empty();
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "GET",
    url: "/quotes/" + thisId
  }).then(function(data) {
    $("#comments").append("<h6>" + data.headline + "</h6>");
    $("#comments").append(
      "Name: <input id='titleinput' name='title' type='text' class='form-control'><br>"
    );
    $("#comments").append(
      "Comment: <textarea id='bodyinput' name='body' type='text' class='form-control'></textarea><br>"
    );
    $("#comments").append(
      "<button data-id=" +
        data._id +
        " id='savenote' class='btn btn-primary'>Save Note</button>"
    );

    if (data.note) {
      $("#titleinput").val(data.note.title);
      $("#bodyinput").val(data.note.body);
    }
  });
});

$(document).on("click", "#savenote", function() {
  var thisId = $(this).attr("data-id");

  $.ajax({
    method: "POST",
    url: "/quotes/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  }).then(function(data) {
    $("#notes").empty();
  });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});
