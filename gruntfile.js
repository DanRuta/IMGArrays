module.exports = function(grunt){
    grunt.initConfig({
        uglify: {
            my_target: {
                options: {
                    sourceMap: {
                        includeSources: true,
                    },
                    mangle: false,
                },
                files: {
                    "dist/index.min.js" : ["dev/index.js"]
                }
            }
        },

        watch: {
            files: {
                files: ["dev/index.js"],
                tasks: ["uglify"]
            }
        }
    })

    grunt.loadNpmTasks("grunt-contrib-watch")
    grunt.loadNpmTasks("grunt-contrib-uglify-es")

    grunt.registerTask("default", ["watch"])
}