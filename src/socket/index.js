const socket = require('socket.io')

function haversineDistance(coords1, coords2, isMiles = false) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    var lon1 = coords1.longitude;
    var lat1 = coords1.latitude;

    var lon2 = coords2.longitude;
    var lat2 = coords2.latitude;

    var R = 6371;
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return isMiles ? d * 0.621371 : d;
}

class PositionRealTime {
    static posDrivers = new Map();
    static numbersOfRun = new Map();
    static activityDriver = new Map();
    static distances = [];

    static PositionDriver(io) {
        io.on('connection', socket => {
            socket.on('activity', data => {
                let ids = this.activityDriver.get(data.id)
                if (!ids) {
                    ids = [];
                }
                ids.push(socket.id);        
                console.log("endpush socket:::", socket.id)
                this.activityDriver.set(data.id, ids)
            })
            socket.on('driverPosition', (data) => {
                this.posDrivers.set(data.id, data.position);
            });

            socket.on('increasNumbersOfRun', (data) => {
                this.numbersOfRun.set(data.id, this.numbersOfRun.get(data.id) + 1)
            })

            socket.on('requestUser', (data) => {
                this.distances = []
                console.log("asdkjahskdjaskfhahksjasjhfa")
                this.posDrivers.forEach((value, key) => {
                    const distance = haversineDistance(data.start, value);
                    this.distances = [ ...this.distances, {idDriver: key, user: data, distance } ];
                });
                this.distances.sort((a, b) => b.distance - a.distance);
                const tagetId = this.activityDriver.get(this.distances[0].idDriver)
                tagetId.forEach(id => {
                    socket.to(id).emit("requestDriver")
                })
            })

            socket.on('accept', (idDriver) => {
                const temp = this.distances.find(data => data.idDriver == idDriver)
                const tagetId = this.activityDriver.get(idDriver)
                console.log(tagetId)
                socket.emit(`success${idDriver}`, temp)
            })

            io.emit('updateDriverPosition', () => {
                return this.posDrivers
            });

            socket.on('disconnect', () => {
                const disconnectedDriverId = [...this.posDrivers].find(
                    ([driverId,]) => socket.id === driverId
                );
                if (disconnectedDriverId) {
                    this.posDrivers.delete(disconnectedDriverId[0]);
                    console.log('Driver disconnected:', disconnectedDriverId[0]);
                }
            });
        })
    }
}


module.exports = PositionRealTime