class PeerBuilder {
    constructor({ peerConfig }) {
        this.peerConfig = peerConfig

        const defaultFunctionValue = () => { }
        this.onError = defaultFunctionValue
        this.onCallReceived = defaultFunctionValue
        this.onConnectionOpened = defaultFunctionValue
        this.onPeerStreamReceived = defaultFunctionValue
        this.onCallError = defaultFunctionValue
        this.onCloseCall = defaultFunctionValue
    }

    setOnError(fn) {
        this.onError = fn

        return this
    }

    setOnCallError(fn) {
        this.onCallError = fn
        return this
    }

    setOnCloseCall(fn) {
        this.onCloseCall = fn
        return this
    }
    setOnCallReceived(fn) {
        this.onCallReceived = fn

        return this
    }

    setOnConnectionOpened(fn) {
        this.onConnectionOpened = fn

        return this
    }

    setOnPeerStreamReceived(fn) {
        this.onPeerStreamReceived = fn

        return this
    }

    _prepareCallEvent(call) {
        call.on('stream', stream => this.onPeerStreamReceived(call, stream))
        call.on('error', error => this.onCallError(call, error))
        call.on('close', _ => this.onCloseCall(call))

        this.onCallReceived(call)
    }

    _preparePeerInstanceFunction(peerModule){
        class PeerCustomModule extends peerModule{

        }


        const peerCall = PeerCustomModule.prototype.call

        const context = this

        PeerCustomModule.prototype.call = function(id, stream){
            const call = peerCall.apply(this, [id, stream])
            //intercep do call para adicionar os eventos da chamada para quem liga tb
            context._prepareCallEvent(call)

            return call
        }

        return PeerCustomModule

    }

    build() {
        const PeerConstInstance = this._preparePeerInstanceFunction(Peer)
        const peer = new PeerConstInstance(...this.peerConfig)

        peer.on('error', this.onError)
        peer.on('call', this._prepareCallEvent.bind(this))

        return new Promise(resolve => peer.on('open', id => {
            this.onConnectionOpened(peer)
            return resolve(peer)
        }))
    }
}
