window.__onGCastApiAvailable = function(isAvailable) {
    if (isAvailable) {
        initializeCastApi();
    }
};

function initializeCastApi() {
    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });

    const context = cast.framework.CastContext.getInstance();
    context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        function(event) {
            switch (event.sessionState) {
                case cast.framework.SessionState.SESSION_STARTED:
                    console.log('Cast session started');
                    break;
                case cast.framework.SessionState.SESSION_ENDED:
                    console.log('Cast session ended');
                    break;
            }
        }
    );
}

function launchMedia(url) {
    const session = cast.framework.CastContext.getInstance().getCurrentSession();
    if (!session) return;

    const mediaInfo = new chrome.cast.media.MediaInfo(url, 'video/mp4');
    const request = new chrome.cast.media.LoadRequest(mediaInfo);
    
    session.loadMedia(request).then(
        () => console.log('Media loaded'),
        (errorCode) => console.error('Error code: ' + errorCode)
    );
}