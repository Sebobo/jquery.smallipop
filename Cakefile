###!
  Cakefile for jQuery Smallipop
  @author Sebastian Helzle (sebastian@helzle.net or @sebobo)
  
  Usage:
    
    Recompile coffeescript and sass when files change:
      cake watch
    
    Build minified plugin files for production:
      cake -v x.x.x minify
###

pluginName = 'smallipop'
{spawn, exec} = require 'child_process'

task 'watch', 'Watch sass and src folders for changes and recompile from src and scss folders to lib and css', ->
  
  console.log "Watching src folder for changes in coffee scripts"
  
  coffeeProcess = spawn 'coffee', ['--bare', '--join', "lib/jquery.#{pluginName}.js", '--watch', '--compile', 'src/']
  coffeeProcess.stdout.on 'data', (data) -> 
    console.log data.toString().trim()
    
  console.log "Watching scss folder for changes in sass files"
      
  sassProcess = spawn 'sass', ['--style', 'compact', '--watch', 'scss:css']
  sassProcess.stdout.on 'data', (data) -> 
    console.log data.toString().trim()


option '-v', '--version [VERSION_STRING]', 'set the output files version for `minify`'
task 'minify', 'Minify the plugins *.js and *.css before release', (options) ->
  
  return console.log 'Please provide a version string' unless options.version?
  
  exec "java -jar \"/Applications/yuicompressor.jar\" -o lib/jquery.#{pluginName}-#{options.version}.min.js lib/jquery.#{pluginName}.js", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "Created minified js file"
    
  exec "sass --style compressed scss/jquery.#{pluginName}.scss css/jquery.#{pluginName}-#{options.version}.min.css", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log "Created compressed css file"
