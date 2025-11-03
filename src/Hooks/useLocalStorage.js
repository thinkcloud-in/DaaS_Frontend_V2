let useLocalStorage=(key)=>{
    let setItem=(value)=>{
        try{
            window.localStorage.setItem(key,value)
        }
        catch(err){
           
        }
    }
    let getItem=(key)=>{
        try{
            let value=window.localStorage.getItem(key)
            return value?value:undefined
        }
        catch(err){
     
        }
    }
    let deleteItem=(key)=>{
        try{
            window.localStorage.removeItem(key)
        }
        catch(err){
  
        }
    }
}
export default useLocalStorage