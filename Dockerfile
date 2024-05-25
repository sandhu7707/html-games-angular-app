#escape=`

FROM httpd:2.4
ADD dist/hello-world/browser /usr/local/apache2/htdocs/
EXPOSE 80