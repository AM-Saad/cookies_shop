
module.exports = (req) => {
    var host = req.get('host');
    var subdomain = host ? host.substring(0, host.lastIndexOf('.')) : null;
    if(subdomain){
        return true
    }else{
        return false
    }
    // return subdomain;
}




    // function getSubdomainList(host) {
    //     var subdomainList = host ? host.split('.') : null;
    //     if (subdomainList)
    //         subdomainList.splice(-1, 1);
    //     return subdomainList;
    // }




