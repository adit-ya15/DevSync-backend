const adminAuth = (req,res,next) => {
    const token = "stk";
    const isAuthorized = token === "stk";
    if(!isAuthorized){
        res.status(401).send("unauthorizd admin");
    }else{
        next();
    }
}

module.exports = {adminAuth}