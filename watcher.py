#!/usr/bin/python
# -*- coding: utf-8 -*-
"""
Watcher script for scss and coffeescript
By Sebastian Helzle sebastian@helzle.net
"""

import os, multiprocessing, logging

def coffee_daemon():
    logging.info('Starting: %s' % multiprocessing.current_process().name)
    
    # Start coffeescript watcher
    os.spawnlp(os.P_WAIT, 'coffee', 'coffee', '-b', '-o', 'lib/', '--watch', '-c', 'src/')
    
    logging.info('Exiting : %s' % multiprocessing.current_process().name)

def sass_daemon():
    logging.info('Starting: %s' % multiprocessing.current_process().name)
    
    # Start css watcher
    os.spawnlp(os.P_WAIT, 'sass', 'sass', '--style', 'expanded', '--watch', 'scss:css')
    
    logging.info('Exiting : %s' % multiprocessing.current_process().name)

def main():
    logging.getLogger().setLevel(logging.DEBUG)
    
    coffee = multiprocessing.Process(name='coffee_daemon', target=coffee_daemon)
    coffee.daemon = True

    scss = multiprocessing.Process(name='sass_daemon', target=sass_daemon)
    scss.daemon = True
    
    try:
        coffee.start()
        scss.start()
    
        coffee.join(1)
        scss.join()
    
        logging.info('Processes ended')
    except KeyboardInterrupt:
        try:
            coffee.terminate()
            logging.info('Process coffee ended by interrupt')
        except Exception, e:
            logging.info('Processes coffee could not be terminated: %s' % e)
            
        try:
            scss.terminate()
            logging.info('Process scss ended by interrupt')
        except Exception, e:
            logging.info('Processes scss could not be terminated: %s' % e)

if __name__ == '__main__':
    main()
