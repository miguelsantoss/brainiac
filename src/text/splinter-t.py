from splinter import Browser
import time

file = 'corpus/pdf/p03357fdbc3285a1f.pdf'

with Browser() as browser:
    # Visit URL
    url = "http://smmry.com"
    browser.visit(url)
    inputFile = browser.driver.find_element_by_name('file').send_keys(file)  
    # browser.attach_file('file', file)
    time.sleep(60)
