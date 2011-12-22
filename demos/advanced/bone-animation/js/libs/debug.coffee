debug = 
    logs: []
    ul: null
    assert: ( condition, message = '' ) ->
        throw "Assertion failed: " + message unless condition
    log: ( message, level, category ) ->
        li = document.createElement 'li'
        li.appendChild document.createTextNode message
        ul.appendChild li
        li.scrollIntoView()
    init: ->
        div = document.createElement 'div'
        ul = document.createElement 'ul'
        div.className = 'debug'
        div.appendChild ul
        document.body.appendChild div
    
