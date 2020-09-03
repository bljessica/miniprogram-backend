const fs = require('fs')

const Question = require('../util/dbcon').Question

//读取初始文件
function readQues(){
    fs.readFile('../static/questions.txt', 'utf-8', (err, data) => {
        if(err){
            console.log('error')
        }
        data = data.toString()
        let quesArr = data.split('\n'), res = [];
        quesArr.map((item, index, arr) => {
            let subject = item.substring(0, 2), type = null, chapter = null, quesNumber = null, typeEnd = null;
            let tmp = null, chapterNumber = null;
            if(item.indexOf('<dan>') != -1){
                type = '单';
                tmp = item.indexOf('单选');
                chapterNumber = item.substring(2, 4);
                chapter = item.substring(4, tmp - 2);
                quesNumber = item.substring(tmp + 2, tmp + 5);
                typeEnd = item.indexOf('</dan>')
            } 
            else{
                type = '多';
                tmp = item.indexOf('多选');
                chapterNumber = item.substring(2, 4);
                chapter = item.substring(4, tmp - 2);
                quesNumber = item.substring(tmp + 2, tmp + 5)
                typeEnd = item.indexOf('</duo>')
            }

            let a = item.indexOf('A.'), b = item.indexOf('B.'), c = item.indexOf('C.'), d = item.indexOf('D.');
            let ques = item.substring(typeEnd + 6, a).replace(/^\s+|\s+$/g, '');
            let quesA = item.substring(a, b).replace(/^\s+|\s+$/g, '');
            let quesB = item.substring(b, c).replace(/^\s+|\s+$/g, '');
            let quesC = item.substring(c, d).replace(/^\s+|\s+$/g, '');
            let quesDStr = item.substring(d);
            let firstT = quesDStr.indexOf('\t');
            let quesD = quesDStr.substring(0, firstT);
            let tipStart = quesDStr.indexOf('<tip7>'), tipEnd = quesDStr.lastIndexOf('</tip7>');
            let tip = quesDStr.substring(tipStart + 6, tipEnd).replace(/<\/tip7>/g, '').replace(/<tip7>/g, '');
            // let tip = quesDStr.substring(tipStart + 6);
            let ansStart = item.indexOf('<true1>'), ansEnd = item.indexOf('</true1>');
            let spanIndex = ques.indexOf('<span');
            ques = ques.replace(ques.substring(spanIndex, ansStart), '').replace(/^\s+|\s+$/g, '');
            let ans = item.substring(ansStart + 7, ansEnd);
            
            res.push({
                subject: subject,
                chapterNumber: chapterNumber,
                chapter: chapter,
                type: type,
                quesNumber: quesNumber,
                question: ques,
                A: quesA,
                B: quesB,
                C: quesC,
                D: quesD,
                answer: ans,
                tip: tip
            });
        })
        // console.log(res)
        fs.writeFile('../static/output.txt', JSON.stringify(res), (err) => {
            if(err){
                console.log('error')
            }
        });
    })

}

//将题目存入数据库
function saveQuestions() {
    // createSet(db, 'questions');
    fs.readFile('../static/output.txt', 'utf-8', (err, data) => {
        if (err){
            console.log('error')
        }
        let arr = JSON.parse(data);
        for(let question of arr){
            Question.create(question, (err, data) => {
                if(err){
                    console.log('error')
                    return
                }
            })
        }
    })
}

// readQues();