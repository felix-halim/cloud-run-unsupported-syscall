const fs = require('fs');
const execSync = require('child_process').execSync;
const express = require('express');

const WORKDIR = '/app/workdir';

const app = express();

app.get('/', async (req, res) => {
  try {
    console.log('Received a compile request.');

    // Creates the working directory.
    execSync(`mkdir -p ${WORKDIR}`);

    // Write a simple C code to the working directory.
    fs.writeFileSync(`${WORKDIR}/code.c`, `#include <stdio.h>
int main() {
  puts("Hello");
}`);

    // Write a temporary script "r.sh" to compile the C code above.
    fs.writeFileSync(`${WORKDIR}/r.sh`, `#!/bin/sh
gcc -g -O2 -std=gnu11 code.c -o program -lm`);

    const fileSizeKb = 64 << 10;
    const timeLimit = 10;
    const memLimitKb = 512 << 10;

    fs.writeFileSync(
      `${WORKDIR}/judge.sh`,
      `#!/bin/bash
chmod 777 ${WORKDIR}
chmod 755 r.sh
/app/runguard \
--user="ojapp" \
--group="ojapp" \
--walltime="${timeLimit}" \
--cputime="${timeLimit}" \
--memsize="${memLimitKb}" \
--filesize="${fileSizeKb}" \
--nproc="100" \
--no-core \
--stdout="stdout" \
--stderr="stderr" \
--streamsize="${fileSizeKb}" \
--outmeta="meta" \
-- ./r.sh 2> runguard.err`);

    console.log(`Compiling code.c to a binary called "program"`);
    execSync(`(cd ${WORKDIR}; bash judge.sh)`);

    // There should be a new binary called "program", run it.
    execSync(`(cd ${WORKDIR}; ./program > output)`);

    const output = fs.readFileSync(`${WORKDIR}/output`, 'utf8');
    console.log(`The code output = ${output}`);

    // Should send back "Hello" if successful.
    return res.send(output);

  } catch (e) {

    console.error(`judge failed`, e);
    return res.send(`judge failed ${e.message}`);
  }
});

const port = 8080;
app.listen(port, () => console.log(`grader listening on port ${port}`));
