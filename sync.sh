# synchronize the generated file
rm -r 404.html about assets feed.xml index.html jekyll js
cp -r ~/myBlog/_site/* .

git add .
git commit -m "updated at `date '+%Y-%m-%d %H:%M:%S'`"
git push origin master
