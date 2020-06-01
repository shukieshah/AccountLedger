# AccountLedger

## Description:

AccountLedger is a REST API, written in [Node.js](https://nodejs.dev/), that tracks the state of various ledger balances for a given customer account. The API communicates with a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster for data persistence and basic [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) capabilities.

The API is exposed and deployed on an AWS EC2 instance (public IP http://18.212.100.191). Clone this repository to experiment with or run the API locally.

## Instructions for Running Locally

In order to run the API locally, ensure you have Node.js and npm installed.

After cloning the repository, navigate to the root project directory and install the node module dependencies:

#### `npm install`

Then, in the project directory, you can run:

#### `npm run dev`

Runs the app in development mode.

Open http://localhost:3000 to test the endpoints in the browser.


## GET request endpoints:

### getCustomerAccountIds
----
  Returns json with all of the active Customer Account IDs in the database.

* **URL**

  /getCustomerAccountIds

*  **URL Params**

   None

* **Success Response:**

  * **Content:** 
  
  ```
    [
        { "customerAccountId": "abcd1234" }, 
        { "customerAccountId": "12345" }, 
        { "customerAccountId": "abc12345" }
    ]
  ```
 
* **Error Response:**

  * **Content:** `{ "error": "A database error has occurred" }`

* **Sample Call:**

  ```
    curl -X GET http://18.212.100.191/getCustomerAccountIds
  ```

### getCustomerAccountData
----
  Returns json with all of the data and ledger history pertaining to a specific Customer Account.

* **URL**

  /getCustomerAccountData

*  **URL Params**

   **Required:**
 
   `customerAccountId=[Unique String ID]`

* **Success Response:**

  * **Content:** 

  ```
    {
        "_id": "5ed3428a6440b04796141525",
        "customerAccountId": "12345",
        "firstName": "John",
        "lastName": "Doe",
        "ledgers": {
            "principal": [
                {
                    "timestamp": "1970-01-01T00:00:00.000Z",
                    "balance": 0
                },
                {
                    "timestamp": "2020-05-31T09:14:10.209Z",
                    "balance": 1000
                }
            ],
            "applicationFee": [
                {
                    "timestamp": "1970-01-01T00:00:00.000Z",
                    "balance": 0
                },
                {
                    "timestamp": "2020-05-30T05:37:14.406Z",
                    "balance": 15
                },
                {
                    "timestamp": "2020-05-31T08:15:13.209Z",
                    "balance": 35
                }
            ],
            "principalPaid": [
                {
                    "timestamp": "1970-01-01T00:00:00.000Z",
                    "balance": 0
                }
            ],
            "interestFee": [
                {
                    "timestamp": "1970-01-01T00:00:00.000Z",
                    "balance": 0
                }
            ],
            "interestFeePaid": [
                {
                    "timestamp": "1970-01-01T00:00:00.000Z",
                    "balance": 0
                }
            ],
            "lateFees": [
                {
                    "timestamp": "1970-01-01T00:00:00.000Z",
                    "balance": 0
                }
            ]
        }
    }
  ```
 
* **Error Response:**

    * **Content:** `{ "error": "A database error has occurred" }`

    OR

    * **Content:** `{ "error": "No such customer account found" }`

* **Sample Call:**

  ```
    curl -X GET http://18.212.100.191/getCustomerAccountData?customerAccountId=12345
  ```

### getCurrentLedgerBalances
----
  Returns json with current balances of all available ledgers for a given Customer Account.

* **URL**

  /getCurrentLedgerBalances

*  **URL Params**

   **Required:**
 
   `customerAccountId=[Unique String ID]`

* **Success Response:**

  * **Content:** 

  ```
    {
        "principal": 1000,
        "applicationFee": 35,
        "principalPaid": 0,
        "interestFee": 0,
        "interestFeePaid": 0,
        "lateFees": 0
    }
  ```
 
* **Error Response:**

    * **Content:** `{ "error": "A database error has occurred" }`

    OR

    * **Content:** `{ "error": "No such customer account found" }`

* **Sample Call:**

  ```
    curl -X GET http://18.212.100.191/getCurrentLedgerBalances?customerAccountId=12345
  ```

### getPreviousLedgerBalance
----
  Returns json with the previous balance of a specific ledger type (that differs from the current balance of that ledger type) for a given Customer Account.

* **URL**

  /getPreviousLedgerBalance

*  **URL Params**

   **Required:**
 
   ```
   customerAccountId=[Unique String ID]
   ledgerName=[String]
   ```

* **Success Response:**

  * **Content:** `{ "principal": 0 }`
 
* **Error Response:**

    * **Content:** `{ "error": "A database error has occurred" }`

    OR

    * **Content:** `{ "error": "No such customer account found" }`

    OR

    * **Content:** `{ "error": "No ledger specified" }`

    OR

    * **Content:** `{ "error": "No such ledger found" }`

* **Sample Call:**

  ```
    curl -X GET http://18.212.100.191/getPreviousLedgerBalance?customerAccountId=12345&ledgerName=principal
  ```

### getLedgerBalanceByDate
----
  Returns json with the balance and timestamp of a specific ledger type given a specific date in the past. If there are no exact matches, the closest prior record will be returned.

* **URL**

  /getLedgerBalanceByDate

*  **URL Params**

   **Required:**

   ```
    customerAccountId=[Unique String ID]
    ledgerName=[String]
    timestamp=[Valid Date String]
   ```

* **Success Response:**

  * **Content:** `{ "applicationFee": 15, "timestamp": "2020-05-30T05:37:14.406Z" }`
 
* **Error Response:**

    * **Content:** `{ "error": "A database error has occurred" }`

    OR

    * **Content:** `{ "error": "No such customer account found" }`

    OR

    * **Content:** `{ "error": "No ledger specified" }`

    OR

    * **Content:** `{ "error": "No such ledger found" }`

    OR

    * **Content:** `{ "error": "Invalid timestamp" }`

* **Sample Call:**

  ```
    curl -X GET http://18.212.100.191/getLedgerBalanceByDate?customerAccountId=12345&ledgerName=applicationFee&timestamp=2020-05-31
  ```

## POST request endpoints:

### createCustomerAccount
----
  Creates a customer account in the database with default ledger values and timestamps.

* **URL**

  /createCustomerAccount

*  **Body Params**

   **Required:**

   ```
    customerAccountId=[Unique String ID]
    firstName=[String]
    lastName=[String]
   ```
 
* **Error Response:**

    * **Content:** `{ "error": "A database error has occurred" }`

    OR

    * **Content:** `{ 'error': 'Invalid or missing account parameters' }`

* **Sample Call:**

  ```
    curl -X POST \
    http://18.212.100.191/createCustomerAccount \
    -d 'customerAccountId=asdfghjkl&firstName=Bob&lastName=Bobberman'
  ```

### updateLedgerBalance
----
  Appends a new record with the given balance and timestamp for an existing OR new ledger type. This endpoint can be used to add and expand ledger types for a given Customer Account.

  Note: The timestamp must be >= most recent update for the given ledger type. Records CANNOT be backfilled.

* **URL**

  /updateLedgerBalance

*  **Body Params**

   **Required:**

   ```
    customerAccountId=[Unique String ID]
    ledgerName=[String]
    newBalance=[Int]
    timestamp=[Valid Date String]
   ```

* **Error Response:**

    * **Content:** `{ "error": "A database error has occurred" }`

    OR

    * **Content:** `{ "error": "Invalid or missing parameters" }`

    OR

    * **Content:** `{ "error": "Invalid timestamp" }`

    OR

    * **Content:** `{ "error": "No such customer found" }`

    OR

    * **Content:** `{ "error": "Dates must be sequential (backfilling is NOT allowed)" }`

* **Sample Call:**

  ```
    curl -X POST \
    http://18.212.100.191/updateLedgerBalance \
    -d 'customerAccountId=asdfghjkl&ledgerName=securityDeposit&newBalance=1250&timestamp=1998-01-04'
  ```