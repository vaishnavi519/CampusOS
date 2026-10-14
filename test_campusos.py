
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()

try:
    driver.get("http://localhost:5173/")

    wait = WebDriverWait(driver, 10)

    # Verify that the page body loads
    wait.until(
        EC.presence_of_element_located(("tag name", "body"))
    )

    # Verify that the page title is not empty
    wait.until(lambda d: d.title.strip() != "")

    print("Page title:", driver.title)
    print("Current URL:", driver.current_url)

    assert driver.current_url.startswith(
        "http://localhost:5173/"
    ), "CampusOS homepage URL is incorrect"

    assert driver.title.strip() != "", (
        "CampusOS page title is empty"
    )

    print("TEST PASSED: CampusOS homepage loaded successfully.")

finally:
    driver.quit()
