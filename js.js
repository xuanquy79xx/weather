let arrDate = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
let d = new Date();
let dtList = document.getElementById("languages");
let KEY = "a684070d41eeed9f0ba0d45c3738dfce";
let ID = 1581130;
let DATA = [];
let current, hourly, daily = [];
let nameCity = "Hà Nội";

// read file .json get data
function readTextFile(file, callback) {
    let rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
// run
readTextFile("vn.json", function (text) {
    let data = JSON.parse(text);
    DATA = data;
    setDataLists(data)
});

// read file json push to datalist
function setDataLists(data) {
    let html = ''
    for (const i in data) {
        html += `<option value="${accentedLetters(data[i].name)}"/> `
    }
    dtList.innerHTML = html
}

// click button
function resetForm() {
    document.getElementById("list").value = ""
    document.getElementById("search__lat").value = ""
    document.getElementById("search__lon").value = ""
}
async function searchByCityName() {
    let lat, lon;
    let temp = -1;
    let listName = document.getElementById("list").value
    for (const i in DATA) {
        if (accentedLetters(DATA[i].name) === listName) {
            nameCity = DATA[i].name
            temp = DATA[i].id
            lat = DATA[i].coord.lat
            lon = DATA[i].coord.lon
            resetForm()
            break;
        }
    }
    if (temp !== -1) {
        preLoaded(true)
        await fetchDataDetails(lat, lon, KEY)
    } else alert("invalidate")

}

async function searchByGeolocation() {
    let lat = document.getElementById("search__lat").value
    let lon = document.getElementById("search__lon").value
    if (lat.length > 0 && lon.length > 0) {
        preLoaded(true)
        await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&lang=vi&cnt=1&appid=${KEY}`)
            .then(res => res.json())
            .then(data => {
                if (data.cod == 200) {
                    nameCity = data.city.name
                    fetchDataDetails(lat, lon, KEY)
                } else {
                    alert(data.message)
                    preLoaded(false)
                }
            })
            .catch(err => {
                console.error(err)
                preLoaded(false)
            })
            resetForm()
    } else alert("vui lòng nhập kinh độ và vĩ độ")
}


function fetchDataDetails(lat, lon, key) {
    if (!lat || !lon) return false;
    fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&lang=vi&appid=${key}`)
        .then(res => res.json())
        .then(data => {
            current = data.current
            hourly = data.hourly
            daily = data.daily
            showDetails()
            showChart()
            showDaily()
            preLoaded(false)
        })
        .catch(err => {
            preLoaded(false)
            alert(err)
        })
}

function showDetails() {
    let showDate = handleDate()
    let info = document.querySelector(".weatherNow__information")
    info.innerHTML = `
                    <div class="weatherNow__information--time">
                         <h2>${nameCity}</h2>
                        <p>${showDate.fullTime()}</p>
                        <p>${showDate.fullDate()}</p>
                            <strong data-text="bình minh"><img src="./images/sunrise.svg" alt="sunrise"/> <span>  ${handleDate(current.sunrise).fullTime()}</span></strong>
                            <strong data-text="hoàng hôn"><img src="./images/sunset.svg" alt="sunset"/> <span>  ${handleDate(current.sunset).fullTime()}</span></strong>
                    </div>
                    <div class="weatherNow__information--mainContent">
                        <div class="--main">
                            <img src="http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" alt="${current.weather[0].description}" />
                            <h1>${current.temp} &deg;C</h1>
                        </div>
                        <strong>${current.weather[0].description} | </strong>
                        <strong>mây: ${current.clouds} % | </strong>
                           <strong>tốc độ gió: ${current.wind_speed} m/s</strong>
                    </div>
                    <div class="weatherNow__information--more">
                        <p>độ ẩm: ${current.humidity}% |</p>
                        <p>uv: ${current.uvi} UV |</p>
                        <p>áp suất: ${current.pressure} hPa |</p>
                    </div>
            `
}
function showChart() {
    let showChart = document.querySelector(".weatherNow__chart")
    let chartHtml = ''
    for (let i = 0; i < 10; i++) {
        if (hourly[i].dt)
            chartHtml += `
                     <div class="--item"
                         style="height: ${(hourly[i].temp * 4).toFixed()}px;"
                        data-desc="${hourly[i].weather[0].description}"
                         data-time="${handleDate(hourly[i].dt).fullTime()}">
                      <img src="http://openweathermap.org/img/wn/${hourly[i].weather[0].icon}@2x.png" />
                        <h2>
                            ${hourly[i].temp.toFixed()}&deg;
                        </h2>
                    </div>
                    `
    }
    showChart.innerHTML = chartHtml
}
function showDaily() {
    let listDaily = document.querySelector(".__right")
    let html = ''
    for (let i = 1; i < 7; i++) {
        html += `
                  <div class="__daily--item">
                    <span>  <p>${arrDate[handleDate(daily[i].dt).day()]}</p>${handleDate(daily[i].dt).dm()}</span>
                    <span>
                        <img src="http://openweathermap.org/img/wn/${daily[i].weather[0].icon}@2x.png" />
                    </span>
                    <span>  <p>${daily[i].temp.max.toFixed(1)}&deg;</p> ${daily[i].temp.min.toFixed(1)}&deg;   </span>

                </div>
               `
    }
    listDaily.innerHTML = html
}

//default ha noi

if (localStorage.getItem("lc")) {
    let value = JSON.parse(localStorage.getItem("lc"))
    fetchDataDetails(value.lat, value.lon, KEY)
} else {
    fetchDataDetails(21.0245, 105.8412, KEY)
}


function accentedLetters(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}
function preLoaded(checked) {
    let cssBody = document.body.style
    checked ? cssBody.cursor = "wait" : cssBody.cursor = "default"
}
function handleDate(date) {
    let d;
    date ? d = new Date(date * 1000) : d = new Date()
    return {
        day: () => d.getDay(),
        date: () => d.getDate(),
        month: () => d.getMonth(),
        year: () => d.getFullYear(),
        hours: () => d.getHours(),
        fullTime: () => `${d.getHours()}:${d.getMinutes() > 9 ? d.getMinutes() : '0' + d.getMinutes()}`,
        fullDate: function () {
            return `${arrDate[this.day()]} ${this.date()}/${this.month()}/${this.year()}`
        },
        dm: function () {
            return `${this.date()}/${this.month()}`
        }
    }
}
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(ll => {
            console.log(ll.coords.latitude); // x
            console.log(ll.coords.longitude); // y
        });
    } else {
        console.log("Geolocation is not supported by this browser.")
    }
}





//#region  daily

// function showResultSearch(data) {
//     let dailyLists = document.getElementById("weatherLists")
//     let html = ''
//     for (const i in data) {
//         html += `
//                <div class="weatherLists__item"
//                data-before="${i == 0 ? 'hôm nay' : i == 1 ? 'ngày mai' : arrDate[handleDate(data[i].dt).day()]}
//                ${handleDate(data[i].dt).date()}/${handleDate(data[i].dt).month()}"
//                data-before-hover="${data[i].weather[0].description}"
//                 onclick="weatherDetails(${handleDate(data[i].dt).date()})"
//                >
//                 <div class="weatherLists__item--head">
//                     <img src="http://openweathermap.org/img/wn/${data[i].weather[0].icon}@2x.png" />
//                      <h2>
//                     ${ data[i - 1] !== undefined ? data[i].temp.day < data[i - 1].temp.day ?
//                 ` <i class="fas fa-long-arrow-alt-down weather__down"></i>`
//                 : `<i class="fas fa-long-arrow-alt-up weather__up"></i>`
//                 : ""}
//                        ${data[i].temp.day} &deg;C
//                         </h2>
//                 </div>
//                 <div class="weatherLists__item--content">
//                     <div>
//                         <p class="humidity">độ ẩm <span>${data[i].humidity}%</span></p>
//                         <p class="UV">UV <span>${data[i].uvi}</span></p>
//                     </div>
//                     <div>
//                         <p class="windSpeed">gió <span>${data[i].wind_speed}m/s</span></p>
//                         <p class="clouds">Mây <span>${data[i].clouds}%</span></p>
//                     </div>
//                 </div>
//             </div>
//                `
//     }
//     dailyLists.innerHTML = html
// }
//#endregion


//#region get location
// if (navigator.geolocation) {
//     let lat, lon;
//     navigator.geolocation.getCurrentPosition(ll => {
//         lat = ll.coords.latitude
//         lon = ll.coords.longitude
//         localStorage.setItem("lc", JSON.stringify({ lat, lon }))
//         fetchDataDetails(lat, lon, KEY)
//     });
// } else {
//     console.log("Geolocation is not supported by this browser.")
// }
//#endregion



/*
https://openweathermap.org/weathermap?basemap=map&cities=false&layer=temperature&lat=20.9691&lon=106.0538&zoom=9
new Date(1589522400*1000).toLocaleDateString("vi") // dt
"https://history.openweathermap.org/data/2.5/aggregated/year?lat=35&lon=139&appid={YOUR API KEY}"
// http://api.openweathermap.org/data/2.5/forecast?lat=${lat}lon=${lon}&APPID=a684070d41eeed9f0ba0d45c3738dfce"
// https://openweathermap.org/api/hourly-forecast huong dan
*/
