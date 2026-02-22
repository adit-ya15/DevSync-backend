const validator = require("validator");

const validateSignup = (data) => {
    const { firstName, lastName, email, password } = data;

    // First Name
    if (!firstName || !firstName.trim()) {
        throw new Error("First name is required");
    }

    if (!validator.isLength(firstName.trim(), { min: 2, max: 50 })) {
        throw new Error("First name must be between 2 and 50 characters");
    }

    if (!validator.isAlpha(firstName.replace(/\s/g, ""))) {
        throw new Error("First name must contain only letters");
    }

    // Last Name
    if (!lastName || !lastName.trim()) {
        throw new Error("Last name is required");
    }

    if (!validator.isLength(lastName.trim(), { min: 1, max: 50 })) {
        throw new Error("Last name must be between 1 and 50 characters");
    }

    if (!validator.isAlpha(lastName.replace(/\s/g, ""))) {
        throw new Error("Last name must contain only letters");
    }

    // Email
    if (!email || !validator.isEmail(email)) {
        throw new Error("Invalid email address");
    }

    // Password
    if (
        !password ||
        !validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
        })
    ) {
        throw new Error(
            "Password must be at least 8 characters and include upper, lower and number"
        );
    }
};


const validateProfileEditData = (data) => {
    const allowedFields = [
        "firstName",
        "lastName",
        "age",
        "gender",
        "photoUrl",
        "about",
        "skills"
    ];
    console.log("Keys:", Object.keys(data));

    // Allow only permitted fields
    const isAllowed = Object.keys(data).every((key) =>
        allowedFields.includes(key)
    );

    if (!isAllowed) {
        throw new Error("Invalid fields in update request");
    }

    const { firstName, lastName, age, gender, photoUrl, about, skills } = data;

    // First Name
    if (firstName !== undefined) {
        if (!firstName.trim()) {
            throw new Error("First name cannot be empty");
        }

        if (firstName.trim().length > 50) {
            throw new Error("First name cannot exceed 50 characters");
        }

        if (!validator.isAlpha(firstName.replace(/\s/g, ""))) {
            throw new Error("First name must contain only letters");
        }
    }

    // Last Name
    if (lastName !== undefined) {
        if (!lastName.trim()) {
            throw new Error("Last name cannot be empty");
        }

        if (lastName.trim().length > 50) {
            throw new Error("Last name cannot exceed 50 characters");
        }

        if (!validator.isAlpha(lastName.replace(/\s/g, ""))) {
            throw new Error("Last name must contain only letters");
        }
    }

    // Age
    if (age !== undefined) {
        if (!Number.isInteger(age) || age < 1 || age > 100) {
            throw new Error("Age must be between 1 and 100");
        }
    }

    // Gender
    if (gender !== undefined) {
        const allowedGender = ["male", "female", "other"];

        if (!allowedGender.includes(gender.toLowerCase())) {
            throw new Error("Gender must be male, female or other");
        }
    }

    // Photo URL
    if (photoUrl !== undefined) {
        if (!validator.isURL(photoUrl)) {
            throw new Error("Invalid photo URL");
        }
    }

    // About
    if (about !== undefined) {
        if (!about.trim()) {
            throw new Error("About section cannot be empty");
        }

        if (about.length > 500) {
            throw new Error("About cannot exceed 500 characters");
        }
    }

    // Skills
    if (skills !== undefined) {
        if (!Array.isArray(skills)) {
            throw new Error("Skills must be an array");
        }

        if (skills.length > 20) {
            throw new Error("You can add maximum 20 skills");
        }

        skills.forEach((skill) => {
            if (typeof skill !== "string" || !skill.trim()) {
                throw new Error("Each skill must be a non-empty string");
            }

            if (skill.length > 30) {
                throw new Error("Each skill must be under 30 characters");
            }
        });
    }
};


module.exports = {validateSignup,validateProfileEditData};