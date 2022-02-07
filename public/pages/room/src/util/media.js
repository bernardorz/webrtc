class Media {
    async getCamera(audio = false, video = true) {    
        return await navigator.mediaDevices.getUserMedia({
            video,
            audio : true
        })
    }
}