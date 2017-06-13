import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
 
path = 'corpus/pdf'
fileName = 'corpus/pdf/p03357fdbc3285a1f.pdf'
summaries = []
 
def init_driver():
    driver = webdriver.Firefox()
    driver.wait = WebDriverWait(driver, 5)
    return driver 
 
def summarize(fileName, driver):
    driver.get('http://smmry.com')
    driver.find_element_by_name('sm_count_primary').clear()
    driver.find_element_by_name('sm_count_primary').send_keys('10')
    print(os.getcwd()+'/'+fileName)
    driver.find_element_by_name("file").send_keys(os.getcwd()+'/'+fileName)
    time.sleep(30)
    driver.find_element_by_id('sm_submit').click()
    time.sleep(30)
    text = driver.find_element_by_id('sm_container_output')
    return text.text

if __name__ == "__main__":
    driver = init_driver()
    for subdir, dirs, files in os.walk(path):
        for file in files:
            file_path = subdir + os.path.sep + file
            summary_file_path = subdir[:-3] + 'summary' + os.path.sep + file[:-3] + 'txt'
            print('Summarizing file ', file_path)
            summary = summarize(file_path, driver)
            print('File Summarized, Saving')
            with open(summary_file_path, 'w') as txt_file:
                txt_file.write(summary)
            print('File Saved, waiting 60 seconds for next file...')
            time.sleep(60)
