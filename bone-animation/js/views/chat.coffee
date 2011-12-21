define ->
    lastPoster = {}
    userid2username = {}
    activeTab = 0
    numOpenTabs = 1
    typingMessage = false
    $ = window.$
    mF = null
    Chat =
        init: ( messageFunction ) ->
            mF = messageFunction
            console.log 'init called'
            ( $ '#chat .tabs li' ).click ->
                Chat.switchTab 0
            ( $ '#chat .tabs .public' ).click()
        isTabOpen: ( roomid ) ->
            ( $ '#chat_history_room_' + roomid ).length == 1
        sendMessage: ( roomid, message ) ->
            console.log 'sending message'
            console.log mF
            mF message, roomid
        escapePressed: ->
            return unless typingMessage
            # cancel sending message
            $( '#chat input' ).parent().parent().remove()
            typingMessage = false
        switchTab: ( roomid ) ->
            return unless activeTab != roomid
            if typingMessage
                # cancel sending message
                ( $ '#chat input' ).parent().parent().remove()
                typingMessage = false
            activeTab = roomid

            newActiveRoom = $ '#chat_history_room_' + roomid
            ( $ '#chat .tabs li' ).removeClass 'selected'
            ( $ '#chat_tab_' + roomid ).addClass 'selected'
            ( $ '#chat .room' ).hide()
            newActiveRoom.show()
            Chat.scrollToBottom()
        scrollToBottom: ->
            activeRoom = $ '#chat_history_room_' + activeTab
            history = activeRoom.find 'li'
            if history.length
                history[ history.length - 1 ].scrollIntoView()
        createPrivate: ( userid, avatarurl, firstname ) ->
            ++numOpenTabs
            if numOpenTabs == 2
                # number of tabs increased from 1 to 2
                ( $ '#chat' ).css 'bottom', '80px'
                Chat.scrollToBottom()
            span = ( $ '<span />' ).text firstname
            img = $ '<img src="' + avatarurl + '" alt="' + firstname + '" />'
            close = ( $ '<a class="close" href="">&times;</a>' ).click ->
                Chat.closePrivate userid
                false
            li = $ '<li id="chat_tab_' + userid + '" />' 
            li.click ->
                Chat.switchTab @id.split( '_' )[ 2 ]

            ( $ '#chat .tabs' ).append li.append( img ).append( span ).append( close )
            ( $ '#chat .history' ).append (
                $ '<div class="room" id="chat_history_room_' + userid + '"><ol /></div>'
            ).hide()
            lastPoster[ userid ] = 0
            userid2username[ userid ] = firstname
        closePrivate: ( userid ) ->
            --numOpenTabs
            if numOpenTabs == 1
                ( $ '#chat' ).css 'bottom', 0
                Chat.scrollToBottom()
            ( $ '#chat_tab_' + userid ).remove()
            ( $ '#chat_history_room_' + userid ).remove()
            lastPoster[ userid ] = 0
            if `activeTab == userid`
                Chat.switchTab 0
        appendMessages: ( messages ) ->
            # TODO: optimize; appendMessage should call this, not the other way around
            Chat.appendMessage.apply Chat, message for message in messages
        appendMessage: ( roomid, userid, firstname, message ) ->
            li = $ '<li />'

            if lastPoster[ roomid ] != userid
                authorname = 'Me'
                className = 'author'
                if userid != window.player.id
                    authorname = firstname
                else
                    className += ' self'
                li.append ( $ '<div class="' + className + '" />' ).text authorname
            li.append ( ( $ '<div class="content" />' ).text message )
            ( $ '#chat_history_room_' + roomid + ' ol' ).append li
            lastPoster[ roomid ] = userid
            Chat.scrollToBottom()
        enterPressed: ->
            if typingMessage
                # TODO: re-enable input keys for the game here
                text = ( $ '#chat input' ).val()
                Chat.sendMessage activeTab, text
                ( $ '#chat input' ).parents( 'li' ).remove()
                Chat.appendMessage activeTab, window.player.id, null, text
            else
                # TODO: disable input keys for the game here
                textbox = $ '<input />'
                li = $ '<li />'
                div = $ '<div class="content textbox" />'
                ol = $ '#chat_history_room_' + activeTab + ' ol'
                ol.append li.append div.append textbox
                Chat.scrollToBottom()
                textbox.focus()
            typingMessage = !typingMessage
        appendPossibleAnswers: ( roomid, answers ) ->
            message = $ '<li />'
            ul = $ '<ul />'
            content = $ '<div class="content answer" />'

            for answer in answers
                link = ( $ '<a href="" />' ).click ->
                    if !( $ @ ).hasClass 'disabled'
                        Chat.sendMessage activeTab, window.player.id, null, @innerText
                        Chat.appendMessage activeTab, window.player.id, null, @innerText
                        ul.find( 'a' ).addClass 'disabled'
                    false
                ul.append ( $ '<li />' ).append link.text answer
            message.append content.append ul
            ( $ '#chat_history_room_' + roomid + ' ol' ).append message
            lastPoster[ roomid ] = roomid
            Chat.scrollToBottom()
