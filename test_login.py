from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

try:
    driver.get("http://localhost:5173/login")

    # Check that the login form appears
    wait.until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "form"))
    )

    # Locate the form fields
    email = driver.find_element(By.NAME, "email")
    password = driver.find_element(By.NAME, "password")

    # Check the Sign in button
    button = driver.find_element(
        By.XPATH,
        "//button[@type='submit']"
    )

    assert email.is_displayed()
    assert password.is_displayed()
    assert button.is_displayed()

    print("PASS: Login page loads.")
    print("PASS: Email field is visible.")
    print("PASS: Password field is visible.")
    print("PASS: Sign in button is visible.")

finally:
    driver.quit()