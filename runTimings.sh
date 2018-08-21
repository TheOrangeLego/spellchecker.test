# !/bin/bash

echo "Running timings for anchor-immutable"
anchor anchor-immutable.arr

echo "Running timings for anchor-jslists"
anchor anchor-jslists.arr

echo "Running timings for anchor-concat"
anchor anchor-concat.arr

echo "Running timings for js-immutable"
node js-immutable.js

echo "Running timings for js-lists"
node js-lists.js

echo "Running timings for js-concat"
node js-concat.js

echo "Running timings for js-spell"
node js-spell.js

echo "Running timings for pyret-immutable"
pyret pyret-immutable.arr

echo "Running timings for pyret-jslists"
pyret pyret-jslists.arr

echo "Running timings for pyret-concat"
pyret pyret-concat.arr

echo "Running timings for pyret-original"
pyret pyret-original.arr

echo "Running timings for python"
python python.py

echo "Running timings for python-concat"
python python-concat.py

echo "Running timings for racket"
racket racket.rkt