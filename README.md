# Story Board
A web app for creating and sharing stories created from different data off the internet.

# Technical Documentation

## Installation

```
$ git clone https://github.com/DevCon0/storyboard.git
$ cd storyboard
$ bower install
$ cd server
$ ./serve (for Mac)
$ /bin/server.exe (for Windows)
```

Now visit [localhost:8020](http://localhost:8020/)

## Testing  

Start server:  
```
$ storyboard/server/serve
```

Then in another Terminal window:  
```
$ cd storyboard/server/src
$ go test -v
```

### Architecture Overview

The tech stack is MongoDB, Angular, and Go.

#Release Notes
##### 1/29/2016 - alpha v0.3.6
A user add an Image or GIF file and set a duration in a story.

A user add text that will be converted to speech in a story.

A user can add an optional audio track to the story.

A user can set the audio levels of all video tracks.

A user can replay a story after viewing it.

A user can see a rough outline of their videos in their dashboard.


##### 1/22/2016 - alpha v0.1.4
A user can preview a Story before saving it.

A user can save a created story.

A user can view their created story from the dashboard.

A user can edit a story they’ve created and re-save it.

A user can delete a story they’ve created.


##### 1/15/2016 - alpha v0.0.1

A user can access our site via a web URL (heroku hosted).

A user can sign in to our site with error handling for invalid inputs.

A user can see the top 3 storyboards on the main splash screen.

A user can click on a story and view that storyboard.

A user can navigate to dashboard and createstory pages through the nav bar.

A user can logout of the web site.
