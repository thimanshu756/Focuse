import org.gradle.api.Plugin
import org.gradle.api.Project

class ExpoModulePlugin implements Plugin<Project> {
    void apply(Project project) {
        def rootProject = project.rootProject
        
        // Apply expo-modules-core plugin which provides default android config
        def expoModulesCorePath = new File(["node", "--print", "require.resolve('expo-modules-core/package.json')"].execute(null, project.rootDir).text.trim()).getParentFile()
        def expoModulesCorePlugin = new File(expoModulesCorePath, "android/ExpoModulesCorePlugin.gradle")
        
        if (expoModulesCorePlugin.exists()) {
            // Apply the plugin script - this must happen before android block is evaluated
            project.apply from: expoModulesCorePlugin
            
            // Apply Kotlin plugin if the function is available
            try {
                project.applyKotlinExpoModulesCorePlugin()
            } catch (Exception e) {
                // Function might not be available yet, that's okay
            }
        }
        
        // Ensure android block has compileSdkVersion if not set
        project.afterEvaluate {
            if (project.plugins.hasPlugin('com.android.library') || project.plugins.hasPlugin('com.android.application')) {
                project.android {
                    if (!compileSdkVersion) {
                        compileSdkVersion rootProject.ext.compileSdkVersion ?: 35
                    }
                    if (!buildToolsVersion) {
                        buildToolsVersion rootProject.ext.buildToolsVersion ?: '35.0.0'
                    }
                }
            }
        }
    }
}
