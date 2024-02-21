
document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById("modal");
    const temCon = document.getElementById("temCon");
    const updateModal = document.getElementById("update");
    const previewBtn = document.getElementById("preview");
    const downloadBtn = document.getElementById("downloadFlyer");

    // Setting up date input with Flatpickr
    setMinDateAndRestrictToThursdays();

    function showTemCon() {
        modal.style.display = "none";
        temCon.style.display = "block";
        temCon.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    function hideTemCon() {
      modal.style.marginTop ="50%";
        modal.style.display = "block";
        temCon.style.display = "none";
        temCon.classList.add("hidden");
        document.body.style.overflow = "";
    }

    previewBtn.addEventListener("click", function () {
        showTemCon();
        updateTemplate();
    });

    downloadBtn.addEventListener("click", downloadFlyer);
    updateModal.addEventListener("click", hideTemCon);

    document.getElementById('dateGreInput').addEventListener('change', convertToHijriAndDisplay);
    
    document.getElementById('titleSelect').addEventListener('change', updateTemplate);
});

function setMinDateAndRestrictToThursdays() {
    flatpickr("#dateGreInput", {
        minDate: "today",
        dateFormat: "Y-m-d",
        enable: [function(date) { return date.getDay() === 4; }],
        onChange: [convertToHijriAndDisplay]
    });
}

function updateTemplate() {
  //const title = document.getElementById('titleSelect').value; // Get the selected title value
    document.getElementById('topic').innerText = document.getElementById('topicInput').value;
    document.getElementById('lecturer').innerText = document.getElementById('lecturerInput').value;
    document.getElementById('dateGre').innerText = formatDate(document.getElementById('dateGreInput').value);
    document.getElementById('titlePort').innerText = document.getElementById('titleSelect').value;
}

function convertToHijriAndDisplay() {
    const date = document.getElementById('dateGreInput').value;
    if (date) {
        fetchHijriDate(date, function(hijriDateString) {
            document.getElementById('dateIsl').innerText = hijriDateString;
        });
    }
}

function fetchHijriDate(inputDate, callback) {
    const [year, month, day] = inputDate.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    fetch(`https://api.aladhan.com/v1/gToH/${formattedDate}`)
    .then(response => response.json())
    .then(data => {
        if (data.data && data.data.hijri) {
            const hijri = data.data.hijri;
            callback(`${formatDayWithSuffix(hijri.day)} ${hijri.month.en} ${hijri.year}AH`);
        }
    })
    .catch(error => console.error('Error fetching Hijri date:', error));
}

function formatDayWithSuffix(day) {
    // Remove leading zeros by converting to integer then back to string
    day = parseInt(day, 10).toString();
    const lastDigit = parseInt(day.slice(-1), 10);
    const exceptions = [11, 12, 13];
    const dayInt = parseInt(day, 10);

    // Check if the day is an exception; if not, determine the correct suffix
    let suffix;
    if (exceptions.includes(dayInt)) {
        suffix = 'th';
    } else {
        switch (lastDigit) {
            case 1: suffix = 'st'; break;
            case 2: suffix = 'nd'; break;
            case 3: suffix = 'rd'; break;
            default: suffix = 'th';
        }
    }

    return day + suffix;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { weekday: 'long', month: 'long', year: 'numeric' };
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    // Apply formatDayWithSuffix for the day part
    const dayWithSuffix = formatDayWithSuffix(date.getDate());

    // Constructing the formatted date string with the updated day part
    const formattedDate = `${weekday}, ${month} ${dayWithSuffix}, ${year}`;
    return formattedDate;
}

function downloadFlyer() {
    html2canvas(document.getElementById("templateContainer")).then(function (
      canvas
    ) {
      const link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.download = "flyer.png";
      link.click();
    });
}
