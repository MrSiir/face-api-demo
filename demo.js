const video = document.getElementById('myVideo')

const demoStart = () => {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

const faceApiDemo = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri('assets/weights')
    await faceapi.nets.faceLandmark68Net.loadFromUri('assets/weights')
    await faceapi.nets.faceRecognitionNet.loadFromUri('assets/weights')
    await faceapi.nets.faceExpressionNet.loadFromUri('assets/weights')
    await faceapi.nets.ageGenderNet.loadFromUri('assets/weights')

    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)

    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)

    setInterval(async () => {
        const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender()

        canvas.getContext('2d').clearRect(0, 0, displaySize.width, displaySize.height)
        const resizedResults = faceapi.resizeResults(detections, displaySize)

        faceapi.draw.drawDetections(canvas, resizedResults)
        faceapi.draw.drawFaceLandmarks(canvas, resizedResults)
        faceapi.draw.drawFaceExpressions(canvas, resizedResults, .05)

        resizedResults.forEach(result => {
            const { age, gender, genderProbability } = result
            new faceapi.draw.DrawTextField(
                [
                    `${faceapi.utils.round(age, 0)} years`,
                    `${gender} (${faceapi.utils.round(genderProbability)})`
                ],
                result.detection.box.bottomRight,
                {
                    anchorPosition: 'TOP_RIGHT',
                    backgroundColor: 'transparent'
                }
            )
            .draw(canvas)
        })

    }, 100)
}

video.addEventListener('play', () => {
    faceApiDemo()
})

demoStart()