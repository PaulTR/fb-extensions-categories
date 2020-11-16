# Sentence Classification

**Author**: Firebase (**[https://firebase.google.com](https://firebase.google.com)**)

**Description**: Analyzes a sentence added to Firestore and classifies it. More information on categories can be found [here](https://cloud.google.com/natural-language/docs/categories)


**Details**: Use this extension to analyze strings written to a Cloud Firestore collection and attempts to classify them into a set of categories.

This extension listens to your specified Cloud Firestore collection. If you add a string to a specified field in any document within that collection, this extension:

- Processes the text using Google Cloud's Natural Language Processing API and attempts to classify that text.
- Adds the categories of the string to a separate specified field in the same document.


If the original field of the document is updated, then the categories will be automatically updated, as well.

#### Additional setup

Before installing this extension, make sure that you've [set up a Cloud Firestore database](https://firebase.google.com/docs/firestore/quickstart) in your Firebase project. You will also need to enable the Google Cloud Natural Languages API.

#### Billing
To install an extension, your project must be on the [Blaze (pay as you go) plan](https://firebase.google.com/pricing)

- You will be charged a small amount (typically around $0.01/month) for the Firebase resources required by this extension (even if it is not used).
- This extension uses other Firebase and Google Cloud Platform services, which have associated charges if you exceed the service’s free tier:
  - Cloud Language API
  - Cloud Firestore
  - Cloud Functions (Node.js 10+ runtime. [See FAQs](https://firebase.google.com/support/faq#expandable-24))

**Configuration Parameters:**

* Cloud Functions location: Where do you want to deploy the functions created for this extension? You usually want a location close to your database. For help selecting a location, refer to the [location selection guide](https://firebase.google.com/docs/functions/locations).

* Collection path: What is the path to the collection that contains the strings that you want to analyze?


* Input field name: What is the name of the field that contains the string that you want to analyze?


* Categories output field name: What is the name of the field where you want to store the string's categories?


**Cloud Functions:**

* **fscategories:** Listens for writes of new strings to your specified Cloud Firestore collection, determines the categories, then writes them back to the same document.



**APIs Used**:

* language.googleapis.com (Reason: To use Google Natural Language Processing to apply category analysis.)

**Access Required**:

This extension will operate with the following project IAM roles:

* datastore.user (Reason: Allows the extension to write entity data to Cloud Firestore.)
