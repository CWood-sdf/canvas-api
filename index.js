const dotenv = require("dotenv");

dotenv.config();

// start a process "bash ./canvas.sh"

// Path: canvas.sh
const { exec } = require("child_process");
var parsedOutput = [];

var checkedId = {};

exec("bash ./canvas.sh", (_, stdout) => {
    const output = stdout.toString();
    //json parse the output
    // console.log(output);
    parsedOutput = JSON.parse(output);
    parsedOutput = parsedOutput
        .map((item) => {
            return {
                name: item.name,
                due: Date.parse(item.due_at) / 1000,
                unlock: Date.parse(item.unlock),
                course: item.course_id,
                submitted: !Number.isNaN(Date.parse(item.submit3)),
            };
        })
        .filter(
            (i) =>
                !i.submitted &&
                (i.due > Date.now() / 1000 || Number.isNaN(i.due)) &&
                (i.unlock < Date.now() ||
                    i.unlock === null ||
                    Number.isNaN(i.unlock)),
            // !Number.isNaN(i.due) &&
            // i.due !== null &&
            // i.due > Date.now() / 1000 &&
            // (i.unlock < Date.now() ||
            //     i.unlock === null ||
            //     Number.isNaN(i.unlock)) &&
            // !i.submitted,
        )
        .filter((v, i, a) => a.findIndex((t) => t.name === v.name) === i);
    for (const v of parsedOutput) {
        if (checkedId[v.course]) {
            continue;
        }
        checkedId[v.course] = true;
        exec(
            "curl https://canvas.its.virginia.edu/api/v1/courses/" +
                v.course +
                "?access_token=" +
                process.env.CANVAS_TOKEN,
            (_, stdout) => {
                const output = stdout.toString();
                //json parse the output
                const out = JSON.parse(output);
                checkedId[v.course] = out.name;
                // console.log(out.name);
                var failed = false;
                for (const x in checkedId) {
                    if (checkedId[x] === true) {
                        failed = true;
                    }
                }
                if (!failed) {
                    for (const i in parsedOutput) {
                        parsedOutput[i].course =
                            checkedId[parsedOutput[i].course];
                    }
                    console.log(JSON.stringify(parsedOutput));
                }
            },
        );
    }
});
