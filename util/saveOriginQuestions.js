const fs = require('fs')
const readline = require('readline');

const { Question } = require('./dbcon')

const rl = readline.createInterface({
    input: fs.createReadStream('../static/questions.txt')
});

let index = 0, res = [];


//将题目存入数据库
function saveQuestions() {
    // createSet(db, 'questions');
    fs.readFile('../static/output.txt', 'utf-8', (err, data) => {
        if (err){
            console.log('error' + err)
        }
        let arr = JSON.parse(data);
        for(let question of arr){
            Question.create(question, (err, data) => {
                if(err){
                    console.log('error' + err)
                    return;
                }
            })
        }
    })
}

rl.on('line', (item) => {
    let questionItems = item.split('\t');
    let lenA = questionItems[0].length;
    let options = questionItems[2].replace(/^\s+|\s+$/g, '');
    let answerStart = options.indexOf('<true1>'), answerEnd = options.indexOf('</true1>');
    let indexA = options.indexOf('A.'), indexB = options.indexOf('B.'), indexC = options.indexOf('C.'), indexD = options.indexOf('D.'); 
    let tip = '';
    if(questionItems.length == 4) {
        tip = questionItems[3];
    }
    res.push({
        id: index + 1,
        subject: parseInt(item.substring(0, 2)),
        chapterNumber: parseInt(item.substring(4, 6)),
        chapter: questionItems[0].substring(6, lenA - 7),
        type: parseInt(questionItems[0].substring(lenA - 7, lenA - 5)),
        quesNumber: parseInt(questionItems[0].substring(lenA - 3)),
        question: questionItems[1].replace(/^\s+|\s+$/g, ''),
        A: options.substring(indexA + 2, indexB).replace(/^\s+|\s+$/g, ''),
        B: options.substring(indexB + 2, indexC).replace(/^\s+|\s+$/g, ''),
        C: options.substring(indexC + 2, indexD).replace(/^\s+|\s+$/g, ''),
        D: options.substring(indexD + 2).replace(/^\s+|\s+$/g, ''),
        answer: options.substring(answerStart + 7, answerEnd).replace(/^\s+|\s+$/g, ''),
        tip: tip.replace(/^\s+|\s+$/g, '')
    });
    index++;
});

rl.on('close', () => {
    console.log('read');
    loadAndSave().then(res => {
        saveQuestions();
        console.log('save');
    })
})

function writeOutput(res) {
    fs.writeFile('../static/output.txt', JSON.stringify(res), (err) => {
        if(err){
            console.log('error')
        }
    });
}

function loadAndSave() {
    return new Promise((resolve, reject) => {
        writeOutput(res);
        console.log('write');
        resolve();
    })
}





