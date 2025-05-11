# Backing Data Store Architecture

The Tepper-Bennett web site includes the data in the attached files. This data is used to:

* populate the songs tables, from which users can select songs to:
  * get detailed information about the song
  * click the YouTube play link to play the song
* populate reports, which can be output in the following formats:
  * JSON ("pretty" multiple line)
  * YAML
  * Plain text
  * HTML (the same web UI as the songs table)
  * AwesomePrint (a Ruby-specific human-friendly format for which we could remove support to simplify the implementation).
  
The original version of this website used SQLite for the data. 
The SQLite data file was created by a Rake task triggered by a Git pre-commit hook.

Examine this project and suggest strateg(y/ies) to serve the data to perform the above tasks.
Is SQLite still the best approach? Something else? Offer viable alternatives.
