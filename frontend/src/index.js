import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import TransitionGroup from 'react-transition-group/CSSTransitionGroup';
const $ = window.jQuery;

class ContactList extends React.Component {
  constructor(){
    super();
    this.state = {
      name: '',
      phone: '',
      email: '',
      type: 'Friend',
      contacts: [],
      mode: 'input',
      contactIndex: '',
      favorite: false,
      hasTrash: false,
      onlyDisplayFavorites: false,
      filterRender: false

    }
  }

  componentDidMount(){
    $.get('http://localhost:5004/api/contacts')
    .then(contacts => {
      this.setState({contacts:contacts});
    })
    .catch(err => console.log(err.message));
  }

  addContact(event){
    event.preventDefault();
    if (this.state.name !== ''){
      console.log('submiting new contact');
      let newContact = {name: this.state.name, phone: this.state.phone,
        email: this.state.email, type:this.state.type, favorite: this.state.favorite};
      $.ajax({
        method: 'POST',
        url: 'http://localhost:5004/api/contacts',
        data: JSON.stringify(newContact),
        contentType: 'application/json'
      })
      .then((contact) => {
        this.setState(contact);
        return contact;
      } )
      .then(contact => this.state.contacts.push(contact))
      .then((val) => {
        this.setState({
          name: '',
          phone: '',
          email: '',
          type: '',
          contacts: this.state.contacts,
          favorite: false
        });
      })
      .catch(err => console.log(err.message));

    }

  }
  sumthangChanged(item,event){
    this.setState({
      [item]:event.target.value
    })

  }

  radioButtonChanged(value){
    this.setState({favorite: value})

  }

  deleteContact(idx){
    console.log("deleting contact with db id of: " + idx);
    $.ajax({
      method: 'DELETE',
      url: 'http://localhost:5004/api/contacts/'+idx
    })
    .then( value => console.log("delete api return value: " + value))
    .then( value => {
      let contactstmp = this.state.contacts;
      contactstmp = contactstmp.filter(item => item.id !== idx);
      this.setState({contacts: contactstmp, type:'Friend', name: '',phone:'',email:'',mode:'input',favorite: false});
      }
    )
    .catch( err => console.log("error: " + err.message));

    this.setState({name: '',phone:'',email:'',mode:'input', favorite: false});
    setTimeout(()=>this.setState({hasTrash:true}),1000);

  }

  saveEdit(){
    console.log("saving Edit");
    // let contactstmp = this.state.contacts;
    let idx = this.state.id;
    console.log("contact id in Database: " + idx);
    let contactObject = {name: this.state.name,
      phone: this.state.phone,
      email: this.state.email,
      type: this.state.type,
      favorite: this.state.favorite,
      id: this.state.id
    };
    console.log('contactObject is on next line');
    console.log(contactObject);
    $.ajax({
      method: 'PUT',
      url: 'http://localhost:5004/api/contacts/'+idx,
      data: JSON.stringify(contactObject),
      contentType: 'application/json'
    })
    .then( contact => {console.log('contact returned: ' + contact); return contact;})
    .then( contact => {
      let contactstmp = this.state.contacts;
      contactstmp = contactstmp.map(item => item.id === idx ? contact : item );
      console.log(contactstmp);
      this.setState({contacts: contactstmp, name: '', phone: '', email: '', type: 'Friend', favorite: false, mode:'input' });

    });
  }

  cancelEdit(){
    console.log("cancelling Edit");
    this.setState({
      name: '',
      phone:  '',
      email:  '',
      mode: 'input',
      type: 'Friend',
      contactIndex: '',
      favorite: false
    })
  }

  editContact(idx){
    console.log("in edit");
    console.log("looking for contact with DB id of: " + idx);
    let contacttmp =  this.state.contacts.filter(contact => contact.id === idx)[0];
    // contacttmp = contacttmp[0];
    contacttmp.mode = 'edit';
    console.log(contacttmp.id);
    console.log(contacttmp);
    this.setState(contacttmp);

  }
  render(){

    return (
      <div className="outerContainer">
        <div className="add">
          <button data-toggle="modal" data-target="#inputForm" className="addEntry" onClick={()=>this.addEntry()}>Add Contact</button>
          {this.state.onlyDisplayFavorites === false ? <button  className="displayOnlyFavorites" onClick={()=>this.setState({onlyDisplayFavorites: true, filterRender: true})}>Display Favorites Only</button>
           : <button  className="displayAllContacts" onClick={()=>this.setState({onlyDisplayFavorites: false})}>Display All Contacts</button>}
        </div>
      <div id="inputForm" className=" fade in modal" role="dialog">
        <div className="modal-dialog">

          <div className="formContainer modal-body">
            <form className="form-group modal-content" onSubmit={(event)=>this.addContact(event)} method="post">
              <label htmlFor="name">Name</label>
              <input className="form-control" type="text" onChange={(event) => this.sumthangChanged('name',event)} name="name" value={this.state.name}/>
              <label htmlFor="phone">Phone</label>
              <input className="form-control" type="text" onChange={(event) => this.sumthangChanged('phone',event)} name="phone" value={this.state.phone}/>
              <label htmlFor="email">Email</label>
              <input className="form-control"  type="text" onChange={(event) => this.sumthangChanged('email',event)} name="email" value={this.state.email}/>
              <label htmlFor="type">Type</label>
              <select className="form-control dropdown" onChange={(event) => this.sumthangChanged('type',event)} name="type" value={this.state.type}>
                <option value="Friend">Friend</option>
                <option value="Co-worker">Co-worker</option>
                <option value="Daughter">Daughter</option>
                <option value="Son">Son</option>
                <option value="Neighbor">Neighbor</option>
                <option value="Parent">Parent</option>
                <option value="Alien">Alien</option>
              </select>
              <div className="">
                  <label id="radioButtonsLabel" htmlFor="inlineRadioOptions">Favorite</label>
                  <label className="radio-inline">
                      <input type="radio" data-checked={this.state.favorite} checked={this.state.favorite === true} onChange={()=> this.radioButtonChanged(true)} name="inlineRadioOptions" id="inlineRadio1" value="Yes"/> Yes
                    </label>
                    <label className="radio-inline">
                      <input type="radio"  data-checked={this.state.favorite} checked={this.state.favorite === false} onChange={()=> this.radioButtonChanged(false)}  name="inlineRadioOptions" id="inlineRadio2" value="No"/> No
                    </label>
              </div>
              <div className="form-group">
              {this.state.mode ==='input' ? <button className="addButton" type="submit">Submit</button>: null}
              {this.state.mode ==='edit' ? <button data-dismiss="modal" onClick={()=>this.saveEdit()} className="saveEditButton" type="button">Save</button>:null}
              {this.state.mode ==='edit' ? <button data-dismiss="modal" onClick={()=>this.cancelEdit()} className="cancelEditButton" type="button">Cancel</button>: null}
              </div>
            </form>
          </div>
        </div>
        </div>
        <div className="title">Contacts</div>
        <div className="contacts">
          <TransitionGroup transitionName={this.state.filterRender?"fastKill": "slowKill"} transitionLeaveTimeout={this.state.filterRender?1:1000} transitionEnterTimeout={1}>





            {this.state.filterRender = false}
            {this.state.contacts.map((contact,idx) => {
                let sundry = ((this.state.onlyDisplayFavorites && contact.favorite) || !this.state.onlyDisplayFavorites);
                return (sundry) ? <div className="contactBoxContainer" key={contact.id}>
                    <div data-id={contact.id} className="contactBox">
                      <div className='edit'>
                        <img alt="" className="editIcon" data-toggle="modal" data-target="#inputForm" onClick={()=>this.editContact(contact.id)} src="/images/Edit.png"/>
                        {contact.favorite ? <img alt="" className="favoriteStar" src="/images/star.png"/>:null}
                      </div>
                      <div className="details">
                        <ul>
                          <li> {contact.name} - {contact.type}</li>
                          <li> {contact.phone}</li>
                          <li> {contact.email}</li>

                        </ul>
                      </div>
                      <div onClick={() => this.deleteContact(contact.id)} className="deleteButton">X</div>
                    </div>
                  </div> : null;
              })

            }





          </TransitionGroup>

        </div>
        {this.state.hasTrash ? <img alt="fulltrashcan" id="trashcan" src="/images/tc-full.png" height="65px"/>:<img alt="emptytrashcan" id="trashcan" src="/images/tc-empty.png" height="50px"/> }

      </div>

    )
  }

}

ReactDOM.render(
  <ContactList/>,
  document.getElementById('root')
);
