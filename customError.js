class returnExeption extends Error{
  constructor(returnValue) { 
    super(returnValue+" was thrown as return, but not caught")
    this.name = "returnExeption"
    this.value=returnValue
    }
  }