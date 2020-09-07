# Security Analysis

| Threat Assessment | Planned Defense Strategy |
| --- | --- |
| A database will be used to store user data, this could possibly be susceptible to SQLi attacks. | Data needs to be kept separate from commands and queries, this can be achieved by using a safe API like REST. All data stored in the database should also be encrypted. |
| As we will have a registration and login system, there is the possibility of broken authentication. To calculate life expectancy, we survey users for age, gender, and ethnicity. We also store users answers to their questions. We don't want anyone who is not the user to see this information. | To prevent this, we could implement a two-factor authentication. We could also limit failed login attempts and implement weak-password checks. |
| When logged out, users should not be able to access answers. (ie, broken access control) | Implement checks before displaying pages and make sure static pages aren't visible to those who are logged out. |
| Users are able to enter data which could lead to XSS attacks. | We can use a framework that automatically escapes XSS like React. |
| Users could try and make shell accounts to skew the data. | Force new users to complete a captcha and verify an email before signing up. |
|A user may try to brute force guess user login credentials. | Limit the number of login attempts and if exceeded, require the user to use the two-factor authentication. |
|A user may try flooding the app with requests for a DDoS attack. | We may want to utilize cloud services to ensure we have more than enough bandwidth in the case of an attack. |
