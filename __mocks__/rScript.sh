#/bin/bash
for i in $*; do
  echo $i
done
>&2 echo "error"
echo "all good"
