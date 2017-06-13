from robobrowser import RoboBrowser
import time

# SM_API_KEY="F62A4FD3DE"
# SM_URL=""
# SM_LENGTH=10
# SM_KEYWORD_COUNT=10
# SM_WITH_BREAK=True

url = 'http://smmry.com/';

file = 'corpus/pdf/p03357fdbc3285a1f.pdf'
filehandle = open(file, 'rb')

browser = RoboBrowser(history=True)
browser.open(url)
file_form = browser.get_forms()[2]
file_form['sm_force_upload_file'].value = filehandle
browser.submit_form(file_form)
time.sleep(60)
print(browser.select('#sm_container_output'))
