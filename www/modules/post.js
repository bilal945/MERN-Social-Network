var Post = React.createClass({
  getInitialState: function(){
    // get all tags
      return({
          // define variables here
          post:[],
          user:[],
          comments:[],
          errorMessage:""

      });
  },
  timeInAgo: function(previous) {
      previous=parseInt(previous);
      var current=Date.now();
      var msPerMinute = 60 * 1000;
      var msPerHour = msPerMinute * 60;
      var msPerDay = msPerHour * 24;
      var msPerMonth = msPerDay * 30;
      var msPerYear = msPerDay * 365;

      var elapsed = current - previous;

      if (elapsed < msPerMinute) {
           return Math.round(elapsed/1000) + ' seconds ago';
      }

      else if (elapsed < msPerHour) {
           return Math.round(elapsed/msPerMinute) + ' minutes ago';
      }

      else if (elapsed < msPerDay ) {
           return Math.round(elapsed/msPerHour ) + ' hours ago';
      }

      else if (elapsed < msPerMonth) {
           return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';
      }

      else if (elapsed < msPerYear) {
           return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';
      }

      else {
           return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';
      }
  },
  postComment: function(e){
    e.preventDefault();
    var comment = this.refs.commentText.value;
    if (comment){
      fetch('/api/comment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          author: this.state.user.username,
          body: comment,
          postID: this.state.post._id,
          createdTimestamp: Date.now()
        })
      })
      .then(function(data){
          return data.json();
      }).then(json => {
        console.log(json);
        if(json.STATUS)
          this.fetchPost();
        this.setState({
          errorMessage: json.MESSAGE
        });
      });
    }
  },
  fetchPost: function(){
    // load data using RESTful call
    fetch('/api/post/'+this.props.id)
    .then(function(data){
        return data.json();
    }).then(json => {
        //console.log("Post: "+json);
        this.setState({
          post: json.post,
          user: json.user,
          comments: json.comments,
        });
    });
  },
  componentWillMount: function(){
    //this.fetchPost();
  },
  componentDidMount: function(){
    this.fetchPost();
  },

  toggleThanks: function(commID){
    //alert("Toggle Thanks fired, UserId:"+ this.props.sessionUserId);
    fetch('/api/comment/thanks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commentId: commID,
        userId: this.props.sessionUserId
      })
    })
    .then(function(data){
        return data.json();
    }).then(json => {
      console.log(json);

      this.fetchPost();
      this.setState({
        errorMessage:"Request was Successful"
      });
    });
  },

  render: function(){
    var comments;
    if(this.state.comments && this.state.comments.length>0){
      comments = this.state.comments;
      comments=this.state.comments.map(function(element, index){
        return (
          <div className="comment">
               <div className="media">
                 <div className="media-left">
                   <a href="#">
                     <img className="media-object photo-profile" src="http://2.gravatar.com/avatar/e6c7bab6a91f886f088a4814832adc81?s=50&d=mm&r=g" />
                   </a>
                 </div>
                 <div className="media-body">
                  <p className="thanks">
                    <a onClick={() => this.toggleThanks(element._id)}><span className="thanksButton">Say Thanks</span></a><br />[{element.thanks.length} thanks]
                  </p>
                   <a href="#" className="anchor-username"><h4 className="media-heading">{element.author}</h4></a>
                   &nbsp; {element.body}<br/>

                   <a href="#" className="anchor-time">{this.timeInAgo(element.createdTimestamp)}</a>

                 </div>
               </div>
          </div>

        );
      }, this);
    } else {
      comments="No Comments on Post";
    }
/*


<p className="comment">
  <span className="author">{element.author.name}</span>
   - Thanks: {element.thanks.length} times
  <span className="thanksbutton">Thanks</span>
</p>

*/
    var tags=this.state.post.tags;

    if(tags && tags.length>0){
      console.log("Tags Length: "+tags.length);
      tags=tags.map(function(element, index){
        element=JSON.parse(JSON.stringify(element));
        return (
          <span className="hashtag">{element}</span>
        );
      });
    } else {
      tags="No Tags";
    }

    var timeAgo = this.timeInAgo(this.state.post.createdTimestamp);

    return(

        <div className="postFBStyle container">
          <div className="col-md-2">
            &nbsp;
          </div>
        	<div className="col-md-6">
                <div className="panel panel-default">
                    <div className="panel-body">
                       <section className="post-heading">
                            <div className="row">
                                <div className="col-md-11">
                                    <div className="media">
                                      <div className="media-left">
                                        <a href="#">
                                          <img className="media-object photo-profile" src="http://2.gravatar.com/avatar/e6c7bab6a91f886f088a4814832adc81?s=50&d=mm&r=g" />
                                        </a>
                                      </div>
                                      <div className="media-body">
                                        <a href="#" className="anchor-username"><h4 className="media-heading">{this.state.user.username}</h4></a><br/>
                                          {tags}
                                        <br/>
                                        <a href="#" className="anchor-time">{timeAgo}</a>
                                      </div>
                                    </div>
                                </div>
                                 <div className="col-md-1">
                                     <a href="#"><i className="glyphicon glyphicon-chevron-down"></i></a>
                                 </div>
                            </div>
                       </section>
                       <section className="post-body">
                           <p><b><u>{this.state.post.title}:</u></b><br/>{this.state.post.content}</p>
                       </section>
                       <section className="post-footer">
                           <hr />
                           <div className="post-footer-comment-wrapper">
                               <div className="comment-form">
                               <form className="commentAdderForm" onSubmit={this.postComment}>
                                  {this.props.user}:&nbsp;
                                   <input type="text" ref="commentText" placeholder="write a comment..."  />
                                   <input type="submit" value="Comment" className="hidden" />
                                   <p className="pee">{this.state.errorMessage}</p>
                               </form>
                               </div>
                               {comments}

                           </div>
                       </section>
                    </div>
                </div>
        	</div>
        </div>


);
/*
      <div class="postFBStyle container">
      	<div class="col-md-5">
              <div class="panel panel-default">
                  <div class="panel-body">
                     <section class="post-heading">
                          <div class="row">
                              <div class="col-md-11">
                                  <div class="media">
                                    <div class="media-left">
                                      <a href="#">
                                        <img class="media-object photo-profile" src="http://2.gravatar.com/avatar/e6c7bab6a91f886f088a4814832adc81?s=50&d=mm&r=g" width="40" height="40" alt="...">
                                      </a>
                                    </div>
                                    <div class="media-body">
                                      <a href="#" class="anchor-username"><h4 class="media-heading">{this.state.post.owner}</h4></a>
                                      <a href="#" class="anchor-time">{timeAgo}</a>
                                    </div>
                                  </div>
                              </div>
                               <div class="col-md-1">
                                   <a href="#"><i class="glyphicon glyphicon-chevron-down"></i></a>
                               </div>
                          </div>
                     </section>
                     <section class="post-body">
                         <p>
                          {this.state.post.content}
                         </p>
                     </section>
                     <section class="post-footer">
                         <hr>
                         <div class="post-footer-option container">
                              <ul class="list-unstyled">
                                  <li><a href="#"><i class="glyphicon glyphicon-thumbs-up"></i> Like</a></li>
                                  <li><a href="#"><i class="glyphicon glyphicon-comment"></i> Comment</a></li>
                                  <li><a href="#"><i class="glyphicon glyphicon-share-alt"></i> Share</a></li>
                              </ul>
                         </div>
                         <div class="post-footer-comment-wrapper">
                             <div class="comment-form">

                             </div>
                             <div class="comment">
                                  <div class="media">
                                    <div class="media-left">
                                      <a href="#">
                                        <img class="media-object photo-profile" src="http://2.gravatar.com/avatar/e6c7bab6a91f886f088a4814832adc81?s=50&d=mm&r=g" width="32" height="32" alt="...">
                                      </a>
                                    </div>
                                    <div class="media-body">
                                      <a href="#" class="anchor-username"><h4 class="media-heading">Media heading</h4></a>
                                      <a href="#" class="anchor-time">{timeAgo}</a>
                                    </div>
                                  </div>
                             </div>
                         </div>
                     </section>
                  </div>
              </div>
      	</div>
      </div>





    /*

    <div className="statusPost">
      <b>Author: </b>{this.state.post.owner}<br/><br/>
      <b>Title:</b> {this.state.post.title}<br/>
      <b>Content:</b> {this.state.post.content}<br/>
      <b>Tags: </b> {tags}<br/>
      <b>Comments: </b>
      {comments}
    </div>

    */
  }
});
