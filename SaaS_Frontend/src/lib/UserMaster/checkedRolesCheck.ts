function checkedRolesCheck(data: any, checkValue:string){
  let checked : any;
  if(Array.isArray(data)){
    checked = data.findIndex((item:any)=>{
      return item.role === checkValue ? true : false
    }) === -1 ? false : true;
    return checked
  }
  else{
    return false;
  }
}

export default checkedRolesCheck;