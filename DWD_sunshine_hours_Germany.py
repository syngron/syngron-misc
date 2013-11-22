#!/usr/bin/python2
#
# (c) author Syn Gron (syngron(a)gmail.com)
#
# Data provided by German Weather Service (Deutscher Wetterdienst, DWD): http://www.dwd.de
# Monthly data available from: http://www.dwd.de/bvbw/appmanager/bvbw/dwdwwwDesktop?_nfpb=true&_pageLabel=_dwdwww_klima_umwelt_klimadaten_deutschland&T82002gsbDocumentPath=Navigation%2FOeffentlichkeit%2FKlima__Umwelt%2FKlimadaten%2Fkldaten__kostenfrei%2Fkldat__D__mittelwerte__node.html%3F__nnn%3Dtrue
# Sonnenscheindauer 1981 - 2010 (aktueller Standort)

from mpl_toolkits.basemap import Basemap, cm
import numpy as np
import matplotlib.pyplot as plt
import csv
import matplotlib
import scipy.interpolate
import sys
import calendar
import locale

#np.set_printoptions(threshold=5)

# minimal and maximal days for common scaling
data_min_fix=0
data_max_fix=300

# resolution of the grid
grd_res=0.01
#grd_res=1

# resolution of the map
map_res='h'
#map_res='c'

# individual scaling or common scaling of the months
individual=True
#individual=False

globalmin=sys.float_info.max
globalmax=0

def setMap(lats, lons, data, showstations):
 
        x = np.array(lons)
        y = np.array(lats)
        z = np.array(data)
      
	    # corners of the map
        lon_min = np.min(x)-1
        lon_max = np.max(x)+1
        lat_min = np.min(y)-1
        lat_max = np.max(y)+1
        if individual:
            data_min = np.min(z)
            data_max = np.max(z)
        else:
            data_min = data_min_fix
            data_max = data_max_fix

        # general map
        m = Basemap(projection = 'merc',llcrnrlat=lat_min, urcrnrlat=lat_max,llcrnrlon=lon_min, urcrnrlon=lon_max,resolution=map_res, area_thresh=100)
        m.drawcoastlines()
        m.drawstates()
        m.drawcountries()

        if not showstations:
            y_inc = (lat_max - lat_min) / grd_res
            x_inc = (lon_max - lon_min) / grd_res
            y_steps = np.linspace(lat_min, lat_max + grd_res, y_inc)
            x_steps = np.linspace(lon_min, lon_max + grd_res, x_inc)
            x_steps, y_steps = np.meshgrid(x_steps, y_steps)
    
            zgrd = matplotlib.mlab.griddata(x, y, z, x_steps, y_steps)
            xgrd, ygrd = m.makegrid(zgrd.shape[1], zgrd.shape[0])
    
            #xgrd,ygrd= np.meshgrid(x_steps,y_steps)
            #zgrd = scipy.interpolate.griddata((x, y), z, (xgrd, ygrd), method='nearest')
    
            xgrd,ygrd = m(xgrd,ygrd)
            m.contourf(xgrd,ygrd,zgrd,cmap=plt.cm.hot_r,vmin=data_min, vmax=data_max)
        
        else:
            # measurement stations
            xpts,ypts = m(lons,lats)
            m.plot(xpts,ypts,'bo')
            
#for xpt, ypt, caption in zip(xpts, ypts, captions):
#    plt.text(xpt,ypt,caption, fontsize=5)

fig, axes = plt.subplots(figsize=(18,10))

# otherwise month names will be in locale language
locale.setlocale(locale.LC_ALL, 'en_US')

myrange=13

lats=[]
lons=[]
captions=[]
alldata=[[] for i in range(myrange)]

with open('DWD_Sonnenschein.csv', 'rb') as f:
    reader = csv.reader(f)
    rownum=0
    for row in reader:
        if rownum>2:
            lats.append(float(row[4][:2]) + float(row[4][5:7])/60.0)
            lons.append(float(row[5][:2]) + float(row[5][5:7])/60.0)
            captions.append(str(row[0]))
            for i in range(myrange):
                alldata[i].append(float(row[i+7]))
        rownum+=1

for i in range(myrange):
    print i
   
    data=alldata[i]

    if i == 12:
        data = np.divide(data,12) # yearly data as mean

    tmpmax=np.max(data)
    tmpmin=np.min(data)
    if tmpmax > globalmax:
        globalmax=tmpmax
    if tmpmin < globalmin:
        globalmin=tmpmin

    plt.subplot(3,6,i+1)

    if i == 12:
        plt.title('Avg. per year')
    else:
        plt.title(calendar.month_name[i+1])

    setMap(lats, lons, data, False)

    if individual:
        plt.colorbar()

plt.subplot(3,6,14)
plt.title('Measurement stations')
setMap(lats, lons, data, True)

print globalmax
print globalmin

if not individual:
    #ax, _ = matplotlib.colorbar.make_axes(plt.gca())
    cax = fig.add_axes([0.92, 0.1, 0.01, 0.8])
    cbar = matplotlib.colorbar.ColorbarBase(cax, cmap=plt.cm.hot_r, norm=matplotlib.colors.Normalize(vmin=data_min_fix, vmax=data_max_fix))
    cbar.set_label('Hours of sunlight')
    cbar.set_clim(data_min_fix, data_max_fix)

fig.canvas.set_window_title('Monthly hours of sunlight')

#if individual:
#    plt.savefig('hours_of_sunlight_individual_scale.png', dpi=300)
#else:
#    plt.savefig('hours_of_sunlight.png', dpi=300)

plt.show()

