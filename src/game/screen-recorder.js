const fs = require("fs");

const {desktopCapturer, remote} = require("electron");
const {Menu, dialog} = remote;

const TYPE = "video/webm; codecs=vp9";

const init = () => {
    const startBtn = document.getElementById("startBtn");
    const stopBtn = document.getElementById("stopBtn");
    const videoSelectBtn = document.getElementById("videoSelectBtn");
    const body = document.body;

    let mediaRecorder;
    let recordedChunks = [];

    startBtn.addEventListener("click", () => {
        mediaRecorder.start();
        startBtn.innerText = 'Recording';
        setDisabled(startBtn);
        setDisabled(videoSelectBtn);
        removeDisabled(stopBtn);
        body.classList.add("recording");
    });

    stopBtn.addEventListener("click", () => {
        mediaRecorder.stop();
        startBtn.innerText = 'Start';
        setDisabled(stopBtn);
        removeDisabled(startBtn);
        removeDisabled(videoSelectBtn);
        body.classList.remove("recording");
    });

    const setDisabled = elem => elem.disabled = true;
    const removeDisabled = elem => elem.removeAttribute("disabled");

    const handleDataAvailable = e => recordedChunks.push(e.data);

    const handleStop = async () => {
        const blob = new Blob(recordedChunks, {type: TYPE});
        const buffer = Buffer.from(await blob.arrayBuffer());

        recordedChunks = [];

        const {filePath} = await dialog.showSaveDialog({
            buttonLabel: "Save video",
            defaultPath: `vid-${Date.now()}.webm`
        });

        if(filePath) fs.writeFile(filePath, buffer, () => console.log("saved"));
    };

    const selectSource = async source => {
        videoSelectBtn.innerText = source.name;

        const constraints = {
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: source.id
                }
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        const options = {mimeType: TYPE};
        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.addEventListener("dataavailable", handleDataAvailable);
        mediaRecorder.addEventListener("stop", handleStop);
        removeDisabled(startBtn);
    };

    const getVideoSources = async () => {
        const inputSources = await desktopCapturer.getSources({
            types: ["window", "screen"]
        });

        const videoOptionsMenu = Menu.buildFromTemplate(
            inputSources.map(source => {
                return {
                    label: source.name,
                    click: () => selectSource(source)
                }
            })
        );

        videoOptionsMenu.popup();
    };

    videoSelectBtn.addEventListener("click", getVideoSources);
};

module.exports = init;