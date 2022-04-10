
'use strict';


const e = React.createElement;
const configURL = new URL('config.json', document.URL).href;

var server, textid, status // will be initialized from JSON config

function mdHtml(markdown){
    return e('div', {dangerouslySetInnerHTML: {__html: marked.marked(markdown)}});
}

function play_alert() {
    document.getElementById('alertwav').play();
}

function check_and_alert(data){
    for(let ch in data.chapters){
        for(let idx in data.chapters[ch]){
            let i = data.chapters[ch][idx];
            // console.log(i);
            if(i.status == 'ERR'){
                play_alert();
                return;
            }
        }
    }
}

function Indicator(props){
    var i = e('div', {key: props.title, className: 'sp_indicator'},
                e('div', {className: 'dulldate', style: {float: 'right'}},
                    'Updated:', props.updated,e('br'),'Changed:', props.changed
                ),
                e('img', {src: 'img/' + props.status + '.png'}),' ',
                e('b', null, props.title), e('br'),
                props.details ? e('span',{className: 'dull'} , props.details) : null, e('br'),
                props.desc ? props.desc : null
            );

    return i;
}

function IndicatorChapter(props) {

    var ch_content = [];
    // ch_content.push(e('h2', {key: 'header-' + props.key}, props['name']));

    for(let i in props['indicators']){
        ch_content.push(Indicator(props['indicators'][i]));
    }

    var chapter = e('div', {key: 'div-' + props.key}, e('h2', {key: 'header-' + props.key}, props['name']), ch_content);
    return chapter;
}

function BlogRecord(props){

    var record = e('div', {className: 'sp_blog', key: props.key},
        e('div', {className: 'dulldate'}, props.created),
        mdHtml(props.text)
    );
    return record;

}

function status(props){

    var statusList = [];

    // Add indicator chapters
    for(let key in props.chapters){
        let ch = IndicatorChapter({'key': 'chapter-'+key, 'name': key, 'indicators': props['chapters'][key]});
        statusList.push(ch);
    }

    // Add blog records
    for (let br in props.blog){
        let r = BlogRecord({'key': 'blog-'+br, 'created': props.blog[br].created, 'text': props.blog[br].text});
        statusList.push(r);
    }
    return statusList;
}

function updatePage(props){
    const titleContainer = document.querySelector('#title');
    titleContainer.text = props['title'];

    const h1Container = document.querySelector('#header');
    h1Container.textContent = props['title'];

    const descContainer = document.querySelector('#desc');

    const descHTML = mdHtml(props.desc);

    ReactDOM.render(descHTML, descContainer);

    //descContainer.textContent = RawHTML(marked(props['desc']));
}

function updateStatus(props){
    let url = new URL('/jstatus/' + props.textid + '/' + props.status, props.server).href;

    fetch(url, {redirect: 'follow'})
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            updatePage(data);

            const domContainer = document.querySelector('#chapters');
            ReactDOM.render(status(data), domContainer);

            check_and_alert(data);
        })
}


// fetch config first
fetch(configURL)
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        updateStatus(data);
        setInterval(() => updateStatus(data), 300 * 1000)
    })



