const express = require("express");

const app = express();

const {adminAuth} = require("./middlewares/auth");

// this is the best way

app.use("/admin",adminAuth);

app.get("/admin/getData",(req,res) =>{
    res.send("Data send successfully");
})

app.get("/admin/deleteUser",(req,res) =>{
    res.send("User deleted successfully");
})

app.listen("9999",() => {
    console.log("Server listens on the port 9999");
});



/*Some important notes
Version number : 4.19.18;
Here 4 represnts = Major
     19 represnts = Minor
     18 represents = Patch

PATCH : means the bug fixes or some interal changes which not break the previous version
MINOR : means the minor changes like adding the new features that are backward compatible
MAJOR : means the major changes in the dependency it may break the previos version

The version should follow the semver
Semantic Versioning is a standard for version numbers using MAJOR.MINOR.PATCH where patch
releases contain bug fixes, minor releases add backward-compatible features, and major releases 
introduce breaking changes.

WHAT DOES ^ AND ~ MEANS IN THE VERSION NUMBER?
    ^ : This is called caret. Caret allows updates do not break the major version.
    ~ : This symbol is called tilda. This will only allows the patch changes;

    But if the version start with 0;
    then npm consider library as unstable library.
    So it think even the minor updates will break the library.
    That's in these case ^ it means it alows only the patch updates.
*/
