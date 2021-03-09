/* eslint-disable */
/**
* @ Author: Asjad Amin Mufti (AJ)
* @ Version: 2.0.9
* @ Created: 20-May-2019

 * Change Log Version 2.0.9 (9-December-2020)
 * @ Resolved bug where function self calls inside failed request attempts (catch) could not access function
 * 
 * Change Log Version 2.0.7 (17-September-2020)
 * @ Cleaned up some code around the getAllRecords, getRecords and sleep functions, performance improvements
 
 * Change Log Version 2.0.6 (16-July-2020)
 * @ Fixed getAllRecords(tableNo, filter = '') with further internal retries and rejections

* Change Log Version 2.0.5 (19-May-2020)
* @ Fixed getAllRecords(tableNo, filter = '') with retry

* Change Log Version 2.0.5 (17-April-2020)
* @ Introduced delay when retrying

* Change Log Version 2.0.4 (13-April-2020)
* @ Fixed self calling function syntax

* Change Log Version 2.0.3 (13-March-2020)
* @ Removed redundant reference in function uploadFile()

* Change Log Version 2.0.2
* @ Fixed self calling of function when http requests fail

* Change Log Version 2.0.1
* @ removed resolving of records on errors

* Change Log Version 2.0.0
* @ Added promise rejections if request errors out.

* Change Log Version 1.5.0
* @ Re-wrote getAllRecords function.
*/

// Dependencies
const fetch = require("node-fetch");
const request = require("request");
const formDataInstance = require("form-data");

class knack {
  constructor(appId, apiKey) {
    this.projectKey = appId;
    this.projectIntegrationKey = apiKey;
  }
  /**
   *
   * @param {BigInteger} tableNo Pass the table number to retrieve the field map of the table
   */
  getSchematic(tableNo, retry = 3) {
    if (!tableNo || typeof parseInt(tableNo) !== "number") {
      throw new Error("Table / Object No but be an integer!");
    }
    return new Promise((resolve, reject) => {
      fetch(`https://api.knackhq.com/v1/objects/object_${tableNo}/fields`, {
        headers: {
          "X-Knack-Application-Id": this.projectKey,
          "X-Knack-REST-API-KEY": this.projectIntegrationKey,
        },
        method: "GET",
      })
        .then(async (resp) => {
          if (resp.ok) {
            const schema = await resp.json();
            resolve(schema);
          } else {
            return JSON.stringify(resp);
          }
        })
        .catch((error) => {
          reject(error.responseText);
        });
    }).catch(async (error) => {
      if (retry > 0) {
        retry--;
        await this.sleep(5000);
        return this.getSchematic(tableNo, retry);
      } else {
        throw new Error(error);
      }
    });
  }
  uploadFile(type = "file", url, retry = 3) {
    // by default uploads a file, can also be specified as "image"

    return new Promise((resolve, reject) => {
      const formData = new formDataInstance();
      formData.append("files", request(url));
      var theFileHeaders = formData.getHeaders();

      theFileHeaders["X-Knack-Application-Id"] = this.projectKey;
      theFileHeaders["X-Knack-REST-API-Key"] = this.projectIntegrationKey;

      fetch(
        `https://api.knack.com/v1/applications/${this.projectKey}/assets/${type}/upload`,
        {
          method: "POST",
          body: formData,
          headers: theFileHeaders,
        }
      )
        .then((resp) => {
          if (resp.ok) {
            resolve(resp.json());
          } else {
            reject(`Server Error: ${resp.statusText}`);
          }
        })
        .catch((error) => {
          reject(`Server Error:`, error);
        });
    }).catch(async (error) => {
      console.log(error);

      if (retry > 0) {
        retry--;
        await this.sleep(5000);
        return this.uploadFile(type, url, retry);
        // setTimeout(() => {
        //   this.uploadFile(type, url, retry);
        // }, 5000);
      } else {
        console.log("Failed to upload file/image! ", error);
      }
    });
  }

  // This function retrieves all of the records from a table
  getAllRecords(tableNo, filter = "", retry = 10) {
    var allRecords = [];
    return new Promise(async (resolve, reject) => {
      try {
        const resp = await this.getRecords(tableNo, filter);
        if (!resp["records"]) {
          reject("Issue communicating with the platform server");
        } else {
          for (let x = 0; x < resp.records.length; x++) {
            allRecords.push(resp.records[x]);
          }
        }
        if (resp.total_pages > 1 && resp.current_page < resp.total_pages) {
          var remainingRecords = [];
          for (let y = 2; y <= resp.total_pages; y++) {
            remainingRecords.push(this.getRecords(tableNo, filter, y));
            await this.sleep(400);
            // if (y === 2 || y % 10 !== 0) {
            //   remainingRecords.push(this.getRecords(tableNo, filter, y));
            // } else {
            //   await this.sleep(1000);
            //   remainingRecords.push(this.getRecords(tableNo, filter, y));
            // }
          }
          const allRemainingRecords = await Promise.allSettled(
            remainingRecords
          );
          for (let a = 0; a < allRemainingRecords.length; a++) {
            for (
              let b = 0;
              b < allRemainingRecords[a]["value"]["records"].length;
              b++
            ) {
              allRecords.push(allRemainingRecords[a]["value"]["records"][b]);
            }
          }
          resolve(allRecords);
        } else {
          resolve(allRecords);
        }
      } catch (error) {
        reject(
          "An error occurred, could have been anything, most likely caused by remote server issue: ",
          error
        );
      }
    }).catch(async (error) => {
      console.log(error);
      if (retry > 0) {
        retry--;
        await this.sleep(5000);
        return this.getAllRecords(tableNo, filter, retry);
        // setTimeout(function () {
        //   return this.getAllRecords(tableNo, filter, retry);
        // }, 5000);
      } else {
        console.log("Failed to retrieve records! ", error);
      }
    });
  }

  // Retrieve a 1000 records in one call
  getRecords(tableNo, filter, page = "", retry = 10) {
    var URI = `https://api.knack.com/v1/objects/object_${tableNo}/records?rows_per_page=1000`;
    if (page !== "") {
      URI += `&page=${page}`;
    }
    if (filter !== "") {
      URI += `&filters=${encodeURIComponent(JSON.stringify(filter))}`;
    }
    return new Promise((resolve, reject) => {
      fetch(URI, {
        method: "GET",
        headers: {
          "X-Knack-Application-Id": this.projectKey,
          "X-Knack-REST-API-KEY": this.projectIntegrationKey,
        },
      })
        .then(async (resp) => {
          if (resp.ok) {
            resolve(resp.json());
          } else {
            reject(`Server Error: ${resp.statusText}`);
          }
        })
        .catch((error) => {
          reject(`Server Error:`, error);
        });
    }).catch(async (error) => {
      console.log(error);
      if (retry > 0) {
        retry--;
        await this.sleep(5000);
        return this.getRecords(
          tableNo,
          this.projectKey,
          this.projectIntegrationKey,
          filter,
          page,
          retry
        );
        // setTimeout(function () {
        //   this.getRecords(tableNo, this.projectKey, this.projectIntegrationKey, filter, page, retry);
        // }, 5000);
      } else {
        console.log("Failed to retrieve records! ", error);
      }
    });
  }

  // This function gets a single record with a specified ID
  getRecord(objectNo, recordId, retry = 3) {
    var URL =
      "https://api.knack.com/v1/objects/object_" +
      objectNo +
      "/records/" +
      recordId;

    return new Promise((resolve, reject) => {
      fetch(URL, {
        method: "GET",
        headers: {
          "X-Knack-Application-Id": this.projectKey,
          "X-Knack-REST-API-KEY": this.projectIntegrationKey,
        },
      })
        .then((resp) => {
          if (resp.ok) {
            resolve(resp.json());
          } else {
            reject(`Server Error: ${resp.statusText}`);
          }
        })
        .catch((error) => {
          reject(`Server Error:`, error);
        });
    }).catch(async (error) => {
      console.log(error);

      if (retry > 0) {
        retry--;
        await this.sleep(5000);
        this.getRecord(objectNo, recordId, retry);
        // setTimeout(() => {
        //   this.getRecord(objectNo, recordId, retry);
        // }, 5000);
      } else {
        console.log("Failed to retrieve record! ", error);
      }
    });
  }

  // This function updates a record
  updateRecord(objectNo, data, recordId, retry = 3) {
    var URL =
      "https://api.knack.com/v1/objects/object_" +
      objectNo +
      "/records/" +
      recordId;

    return new Promise((resolve, reject) => {
      fetch(URL, {
        method: "PUT",
        headers: {
          "X-Knack-Application-Id": this.projectKey,
          "X-Knack-REST-API-KEY": this.projectIntegrationKey,
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((resp) => {
          if (resp.ok) {
            resolve(resp.json());
          } else {
            reject(`Server Error: ${resp.statusText}`);
          }
        })
        .catch((error) => {
          reject(`Server Error:`, error);
        });
    }).catch(async (error) => {
      console.log(error);

      if (retry > 0) {
        retry--;
        await this.sleep(5000);
        return this.updateRecord(objectNo, data, recordId, retry);
        // setTimeout(() => {
        //   this.updateRecord(objectNo, data, recordId, retry);
        // }, 5000);
      } else {
        console.log("Failed to update record! ", error);
      }
    });
  }

  // This function creates a new record
  createRecord(objectNo, data, retry = 3) {
    var URL =
      "https://api.knack.com/v1/objects/object_" + objectNo + "/records";

    return new Promise((resolve, reject) => {
      fetch(URL, {
        method: "POST",
        headers: {
          "X-Knack-Application-Id": this.projectKey,
          "X-Knack-REST-API-KEY": this.projectIntegrationKey,
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((resp) => {
          if (resp.ok) {
            resolve(resp.json());
          } else {
            reject(`Server Error: ${resp.statusText}`);
          }
        })
        .catch((error) => {
          reject(`Server Error:`, error);
        });
    }).catch(async (error) => {
      console.log(error);

      if (retry > 0) {
        retry--;
        await this.sleep(5000);
        return this.createRecord(objectNo, data, retry);
        // setTimeout(() => {
        //   this.createRecord(objectNo, data, retry);
        // }, 5000);
      } else {
        console.log("Failed to create record! ", error);
      }
    });
  }

  // This function deletes a record
  deleteRecord(objectNo, recordId, retry = 3) {
    var URL =
      "https://api.knack.com/v1/objects/object_" +
      objectNo +
      "/records/" +
      recordId;

    return new Promise((resolve, reject) => {
      fetch(URL, {
        method: "DELETE",
        headers: {
          "X-Knack-Application-Id": this.projectKey,
          "X-Knack-REST-API-KEY": this.projectIntegrationKey,
        },
      })
        .then((resp) => {
          if (resp.ok) {
            resolve(resp.json());
          } else {
            reject(`Server Error: ${resp.statusText}`);
          }
        })
        .catch((error) => {
          reject(`Server Error:`, error);
        });
    }).catch(async (error) => {
      console.log(error);

      if (retry > 0) {
        retry--;
        await this.sleep(5000);
        return this.deleteRecord(objectNo, recordId, retry);
        // setTimeout(() => {
        //   this.deleteRecord(objectNo, recordId, retry);
        // }, 5000);
      } else {
        console.log("Failed to delete record! ", error);
      }
    });
  }

  sleep(milliseconds) {
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve();
      }, milliseconds);
    });
  }
}
module.exports = knack;
