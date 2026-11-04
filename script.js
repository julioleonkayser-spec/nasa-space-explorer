// NASA Space Explorer
// Gets the Astronomy Picture of the Day (APOD) for a date range and shows them in a gallery.

// NASA api key. DEMO_KEY works but it has a small limit,
// so I use my own free key from api.nasa.gov
var apiKey = "NggqtqpntmbhJqNddmnzKqMfDBkKDpkDhPNQm9qg";

// get things from the page
var startInput = document.getElementById("startDate");
var endInput = document.getElementById("endDate");
var getButton = document.getElementById("getImages");
var gallery = document.getElementById("gallery");
var factText = document.getElementById("fact-text");

var modal = document.getElementById("modal");
var closeButton = document.getElementById("close-modal");
var modalMedia = document.getElementById("modal-media");
var modalTitle = document.getElementById("modal-title");
var modalDate = document.getElementById("modal-date");
var modalText = document.getElementById("modal-text");

// backup pictures (real APOD data from the course)
var backupUrl = "https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json";

// the pictures we got from NASA
var pictures = [];

// fun space facts (a random one shows up every time the page loads)
var facts = [
  "A day on Venus is longer than a year on Venus.",
  "Light from the Sun takes about 8 minutes to get to Earth.",
  "Jupiter's Great Red Spot is a storm that is bigger than Earth.",
  "The Sun has about 99.8% of all the mass in our solar system.",
  "The International Space Station goes around Earth about every 90 minutes.",
  "Saturn is so light for its size that it would float in water, if you could find a bathtub big enough.",
  "Neutron stars can spin hundreds of times every second.",
  "Footprints on the Moon can stay there for a very long time because there is no wind to blow them away."
];

// set up the date inputs (this function is in dateRange.js)
setupDateInputs(startInput, endInput);

// show a random fact
function showFact() {
  var number = Math.floor(Math.random() * facts.length);
  factText.textContent = facts[number];
}
showFact();

// make "2025-04-16" look like "April 16, 2025"
function niceDate(dateText) {
  var date = new Date(dateText + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// get the pictures from NASA
function getImages() {
  var start = startInput.value;
  var end = endInput.value;

  // check the dates first
  if (start === "" || end === "") {
    gallery.innerHTML = '<p class="placeholder">Please pick a start date and an end date.</p>';
    return;
  }
  if (start > end) {
    gallery.innerHTML = '<p class="placeholder">The start date has to be before the end date.</p>';
    return;
  }

  // too many days makes the page really slow, so I limit it
  var days = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
  if (days > 60) {
    gallery.innerHTML = '<p class="placeholder">Please pick 60 days or less.</p>';
    return;
  }

  // loading message
  gallery.innerHTML = '<p class="placeholder">🔄 Loading space photos…</p>';

  var url = "https://api.nasa.gov/planetary/apod?api_key=" + apiKey +
            "&start_date=" + start + "&end_date=" + end + "&thumbs=true";

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("NASA said: " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      // sometimes NASA sends back a plain "NASA Science" logo instead of the real pictures
      if (isPlaceholder(data)) {
        console.log("NASA sent the placeholder, using the backup pictures");
        getBackup(start, end);
      } else {
        pictures = data;
        showGallery();
      }
    })
    .catch(function (error) {
      console.log(error);
      getBackup(start, end);
    });
}

// check if NASA only sent the "NASA Science" logo
function isPlaceholder(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return true;
  }
  for (var i = 0; i < data.length; i++) {
    if (data[i].title !== "NASA Science") {
      return false;
    }
  }
  return true;
}

// backup: a small list of real APOD pictures from our course, filtered by the dates
function getBackup(start, end) {
  fetch(backupUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (all) {
      var found = [];
      for (var i = 0; i < all.length; i++) {
        if (all[i].date >= start && all[i].date <= end) {
          found.push(all[i]);
        }
      }

      // oldest first
      found.sort(function (a, b) {
        return a.date < b.date ? -1 : 1;
      });

      if (found.length === 0) {
        gallery.innerHTML = '<p class="placeholder">NASA is not sending pictures for these dates right now. Try September 18 to October 1, 2025.</p>';
      } else {
        pictures = found;
        showGallery();
      }
    })
    .catch(function (error) {
      console.log(error);
      gallery.innerHTML = '<p class="placeholder">Oops, the photos did not load. Try again in a minute or pick different dates.</p>';
    });
}

// put the pictures on the page
function showGallery() {
  gallery.innerHTML = "";

  if (pictures.length === 0) {
    gallery.innerHTML = '<p class="placeholder">No photos for those dates.</p>';
    return;
  }

  for (var i = 0; i < pictures.length; i++) {
    var item = pictures[i];

    var card = document.createElement("div");
    card.className = "gallery-item";

    // the picture part (it has overflow hidden so the zoom stays inside the box)
    var imageBox = document.createElement("div");
    imageBox.className = "image-box";

    if (item.media_type === "image") {
      var img = document.createElement("img");
      img.src = item.url;
      img.alt = item.title;
      imageBox.appendChild(img);
    } else {
      // videos: use the thumbnail if NASA gave us one
      if (item.thumbnail_url) {
        var thumb = document.createElement("img");
        thumb.src = item.thumbnail_url;
        thumb.alt = item.title;
        imageBox.appendChild(thumb);
      } else {
        imageBox.classList.add("no-thumb");
      }
      var badge = document.createElement("span");
      badge.className = "video-badge";
      badge.textContent = "▶ Video";
      imageBox.appendChild(badge);
    }

    var title = document.createElement("h3");
    title.textContent = item.title;

    var date = document.createElement("p");
    date.textContent = niceDate(item.date);

    card.appendChild(imageBox);
    card.appendChild(title);
    card.appendChild(date);

    // click opens the modal (we pass the number of the picture)
    card.addEventListener("click", makeOpener(i));

    gallery.appendChild(card);
  }
}

// this makes a function that remembers which picture was clicked
function makeOpener(number) {
  return function () {
    openModal(number);
  };
}

// open the modal with the big picture and the explanation
function openModal(number) {
  var item = pictures[number];
  modalMedia.innerHTML = "";

  if (item.media_type === "image") {
    var bigImg = document.createElement("img");
    // hdurl is the big version, some entries don't have it
    bigImg.src = item.hdurl || item.url;
    bigImg.alt = item.title;
    modalMedia.appendChild(bigImg);
  } else if (item.url.indexOf("youtube.com/embed") !== -1) {
    // youtube videos can go right in the page
    var frame = document.createElement("iframe");
    frame.src = item.url;
    frame.title = item.title;
    frame.allowFullscreen = true;
    modalMedia.appendChild(frame);
  } else {
    // other videos get a link
    var link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.textContent = "▶ Watch this video";
    link.className = "video-link";
    modalMedia.appendChild(link);
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = niceDate(item.date);
  modalText.textContent = item.explanation;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// close the modal
function closeModal() {
  modal.classList.add("hidden");
  modalMedia.innerHTML = ""; // this also stops a video that is playing
  document.body.style.overflow = "";
}

// buttons and clicks
getButton.addEventListener("click", getImages);
closeButton.addEventListener("click", closeModal);

// click on the dark part outside the box to close
modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    closeModal();
  }
});

// escape key closes it too
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeModal();
  }
});

// load the pictures when the page opens
getImages();
