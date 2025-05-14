let currSong = new Audio();
let songs;
let currFolder;


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    console.log(response)

    let div = document.createElement("div")
    div.innerHTML = response; 
    console.log(div) 
    let as = div.getElementsByTagName("a")

    songs = [];
    console.log(songs);
    
    console.log("Directory Listing:", as);

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
            console.log("split song:", element.href.split(`/${folder}/`));
            console.log("Found song:", element.href.split(`/${folder}/`)[1]);
        }
    } 


    console.log("Songs array:", songs);
    // Show all the songs in the playlist
    let mySongs = document.querySelector(".playlist").getElementsByTagName("ul")[0];
    mySongs.innerHTML = ""
    for (const song of songs) {
        console.log(song);
        
        if (song) {
            mySongs.innerHTML = mySongs.innerHTML + `
                            <li>
                                <img class="invert" src="./svg/mysong.svg" alt="">
                                <div class="mysonginfo">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                </div>
                            </li>`;
        }
    }


    // Attach an event listener to each song
    Array.from(document.querySelector(".playlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.getElementsByTagName("div")[1].innerHTML);
        })
    });

    return songs;

}


const playMusic = (track, pause = false) => {
    currSong.src = `/${currFolder}/` + track
    if (!pause) {
        currSong.play();
        playButton.src = "./svg/pauseSong.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}


async function displayAlbums() {
    let a = await fetch(`/Songs/`)
    console.log(a)
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    console.log(anchors)
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    console.log(array);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/Songs/") && !e.href.includes(".htaccess")) {
            let folder = (e.href.split("/").slice(-2)[1]);
            console.log(folder);
            let a = await fetch(`/Songs/${folder}/info.json`);
            console.log(a);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder ="${folder}" class="card1 card">
                    <div class="play">
                        <img src="./svg/cardPlay.svg" alt="Play button">
                    </div>
                    <img src="./Songs/${folder}/${response.image}" alt="Album Cover">
                    <h3>${response.title}</h3>
                    <p>${response.description}</p>
                </div>`;
        }
    }


    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

            document.querySelector(".left").style.left = 0;
        })
    })
}


async function main() {
    await getSongs("Songs/arijit");
    playMusic(songs[0], true)

    displayAlbums();

    playButton.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play();
            playButton.src = "./svg/pauseSong.svg"
        } else {
            currSong.pause();
            playButton.src = "./svg/playSong.svg"
        }
    })

    // Listen for timeupdate event
    currSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)} / ${secondsToMinutesSeconds(currSong.duration)}`
        document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%"
    })

    //Add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currSong.currentTime = ((currSong.duration) * percent) / 100;
    })

    // Add an event listener for Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    // Add an event listener for close button
    document.querySelector(".closesvg").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //Add an event listener to previous and next button
    prevButton.addEventListener("click", () => {
        currSong.pause();
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    nextButton.addEventListener("click", () => {
        currSong.pause();
        let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //Add an event to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currSong.volume = parseInt(e.target.value) / 100;
        if(currSong.volume > 0) {
            document.querySelector(".volumeButton>img").src = document.querySelector(".volumeButton>img").src.replace("mute.svg", "volume.svg");
        }
    })

    //Add Event Listeners to mute the Tracks
    document.querySelector(".volumeButton>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

}

main();
