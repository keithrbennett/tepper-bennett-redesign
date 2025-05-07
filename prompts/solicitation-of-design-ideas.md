# Soliciation for Design Ideas for Tepper-Bennett Songwriters Website

This prompt relates to the web site at https://www.tepper-bennett.com. Roy C. Bennett and Sid Tepper wrote songs together from the 1940's through 1970's that were sung my many famous singers of the day, including dozens of songs sung by Elvis Presley in his movies.

### Objective

##### The design is currently old-fashioned and boring. I would like you to give me ideas, preferably including images, for how it could be changed to be more engaging, modern, and attractive. I do not need code yet, as long as the designs you provide are implementable without unreasonable complexity or difficulty. As a start, the following would be helpful for a start:

* suggested home page designs incorporating the photo of Tepper and Bennett, with text superimposed on the photo or outside of it
* suggested organization of the available data (see below for more on that), possibly with multiple view modes (summary/detail, etc.)
* suggested ways to present the song play tables
* other suggestions

### Resources for You to Consult

I will upload images of the web site screens for your review. You can also look at the source code at https://github.com/keithrbennett/tepper-bennett .

### Web Site Purposes

* To be a memorial to the songwriters 
* To be a resource for music enthusiasts
* To be a resource for producers of movies, TV, etc., who would be interested in using the songs in their productions

### Current Web Site Layout

The site has the following panels, selectable via a navbar:

* Home - a home page with a nice photo of the duo, and some text about their history
* Songs - a page with scrollable list of the duo's songs, with YouTube links to performances
* Genres - a text page describing the various genres the songs covered
* Elvis - like "Songs", but only the Elvis songs; includes an image of a CD set of the songs
* Resources - links for discography, Wikipedia articles, writer obituaries, and related information
* Reports - links to text reports in HTML, Text, JSON, YAML, and AwesomePrint formats for the following:
    * Songs
    * Performers
    * Song Plays
    * Genres
    * Song Performers
    * Performer Songs
    * Song Genres
    * Genre Songs
    * Movies
    * Movies Songs
    * Organizations
    * Song Rights Administrators
    * Rights Administrator Songs
    * Writers
* Inquiries - information for entertainment professionals seeking to use the songs in their productions

### Goals of the Redesign

We are looking for a new UI design that:

* is modern, attractive, and easy to use, on mobile devices and computers
* provides both casual and attractive modes (e.g. cards) and more informational modes (e.g. lists)
* that will attract and engage users for increased traffic

### Song Tables Containing YouTube Links

The Songs and Elvis panels contain tables for viewing the song titles, performers, rights administrators, and links to YouTube videos. Table features include:

* The table column headings can be clicked to sort the table by that column.
* There is a search bar to search the table data (titles, performers, and administrators) for the specified string.
* The titles double as hyperlinks to a song page displaying the known information about that song.
* The YouTube link opens a new browser tab and opens the YouTube link.

These tables are currently implemented using DataTables.js and Bootstrap 5, but the new implementation does not have to use those tools.


### Web Framework

The application is currently a Ruby on Rails application, with the UI-related code (JS, CSS, HTML) embedded in the Rails app. We are open to splitting the UI off into a separate code base and making the Rails app into a Rails API, if that will produce a better product.

