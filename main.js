const { spawn } = require('child_process');
const fs = require('fs');
const json2xls = require('json2xls');
const http = require('http');
const stdin = process.openStdin();
var readline = require('readline');

let content = '';
let token = '';
let key = '';
let beginCmd = '';
let buildExe = '';
let endCmd = '';

// var rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });


// rl.question('Please provide a login token : ', function (t) {
//     token = t;

//     rl.question('Please provide the key for analysing the project : ', function (k) {
//         key = k;

//         rl.question("Please provide the project path?", function (path) {
//             // TODO: Log the answer in a database

//             rl.close();

//             content = path;
//             console.log(content);

//             beginCmd = `C:\\"Program Files (x86)"\\lolzip\\zip\\SonarQube.Scanner.MSBuild.exe begin  /k:"${key}" /d:sonar.host.url="http://localhost:9000" /d:sonar.login="${token}"`;
//             buildExe = `"C:\\Program Files (x86)\\MSBuild\\14.0\\Bin\\MsBuild.exe" "${content}" /t:Rebuild`;
//             endCmd = `C:\\software\\sonarqube\\zip\\SonarQube.Scanner.MSBuild.exe end /d:sonar.login="${token}"`;

//             console.log(beginCmd, '\n', buildExe, '\n', endCmd);

//             const child = spawn(beginCmd, {
//                 shell: true
//             });
//             child.stderr.on('data', function (data) {
//                 console.error("STDERR:", data.toString());
//             });
//             child.stdout.on('data', function (data) {
//                 console.log("STDOUT:", data.toString());
//             });
//             child.on('exit', function (exitCode) {
//                 console.log("Child exited with code: " + exitCode);
//                 if (exitCode === 0) {
//                     console.log("==================begin command succeeded===============");


//                     const child1 = spawn(buildExe, {
//                         shell: true
//                     });
//                     child1.stderr.on('data', function (data) {
//                         console.error("STDERR:", data.toString());
//                     });
//                     child1.stdout.on('data', function (data) {
//                         console.log("STDOUT:", data.toString());
//                     });
//                     child1.on('exit', function (exitCode) {
//                         console.log("Child exited with code: " + exitCode);
//                         if (exitCode === 0) {
//                             console.log("========================build succeeded================================")
//                             const child2 = spawn(endCmd, {
//                                 shell: true
//                             });
//                             child2.stderr.on('data', function (data) {
//                                 console.error("STDERR:", data.toString());
//                             });
//                             child2.stdout.on('data', function (data) {
//                                 console.log("STDOUT:", data.toString());
//                             });
//                             child2.on('exit', function (exitCode) {
//                                 console.log("Child exited with code: " + exitCode);
//                                 if (exitCode === 0) {
//                                     console.log("==================End command succeeded===============");

//                                     setTimeout(() => {
//                                         generateReport()
//                                     },10000);
//                                 }
//                             });
//                         }
//                     });
//                 }
//             });

//         });
//     })
// })



const generateReport = () => {
    c = 1;
    for (let i = 1; i < 21; i++) {
        http.get(`http://localhost:9000/api/issues/search?pageSize=500&componentKeys=july24_7&p=${i}`, (resp) => {
            let data = '';
        
            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                ++c;
                console.log(`http://localhost:9000/api/issues/search?pageSize=500&componentKeys=${key}&p=${i}`);
                console.log('data received');
                const dataProcess = JSON.parse(data);
                console.log(c);

                // console.log('dataprocess issues : ', dataProcess);
                if(dataProcess.issues.length !== 0){
                    accumulateData(dataProcess);
                }
                if (c === 21) {
                    // if(sheetArray.length === 0){
                    //     i=0;
                    //     c=1;
                    //     sheetArray = [];
                    // }
                    processDataToExcel();
                }

            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
        });
    }
}

generateReport();

let sheetArray = [];

const accumulateData = (data) => {
    console.log('Accumulating data....')
    
    data.issues.forEach(issue => {
        const json = {
            Component: issue.component,
            Line: issue.line,
            Severity: issue.severity,
            Status: issue.status,
            Message: issue.message,
            Type: issue.type
        };
        sheetArray.push(json);
    })
}

const processDataToExcel = () => {
    console.log('converting data to excel....');
    
    var xls = json2xls(sheetArray);

    fs.writeFileSync('data.xlsx', xls, 'binary');
    readline
    .createInterface(process.stdin, process.stdout)
    .question("Press [Enter] to exit...", function () {
        process.exit();
    });
}


